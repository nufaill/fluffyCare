// backend/src/services/user/authService.ts
import bcrypt from 'bcrypt';
import { UserRepository } from '../../repositories/userRepository';
import { JwtService } from '../jwt/jwt.service';
import { GoogleAuthService } from '../googleAuth/google.service';
import { AuthResponse, JwtPayload } from '../../types/auth.types';
import { CreateUserData } from '../../types/User.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from "../../util/CustomerError";
import { generateOtp, sendOtpEmail } from 'util/sendOtp';
import { OtpRepository } from 'repositories/otpRepository';
import { sendMail } from '../../util/mailer';
import crypto from 'crypto';
import { config } from '../../config/env';
import { EmailService } from '../emailService/email.service';
import PASSWORD_RESET_MAIL_CONTENT from 'shared/mailTemplate';
import { RegisterUserDTO } from '../../dtos/user.dto';

export interface LoginData {
  email: string;
  password: string;
}


export interface RegisterData extends Omit<RegisterUserDTO, 'location'> {
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}


export class AuthService {
  private validateGeoLocation(location: any): boolean {
    if (!location || typeof location !== 'object') {
      return false;
    }

    // Check if it's proper GeoJSON Point format
    if (location.type !== 'Point') {
      return false;
    }

    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return false;
    }

    const [lng, lat] = location.coordinates;

    // Validate longitude (-180 to 180) and latitude (-90 to 90)
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return false;
    }

    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return false;
    }

    return true;
  }
  private readonly saltRounds = 12;
  otpRepository: OtpRepository;

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private googleService: GoogleAuthService,
    private readonly emailService: EmailService,
    otpRepository: OtpRepository
  ) {
    this.otpRepository = otpRepository;
  }


  generateTokens(id: string, email: string) {
    return this.jwtService.generateTokens({
      id,
      email,
      role :"user"
    });
  }

  // REGISTER
  register = async (userData: RegisterUserDTO): Promise<{ email: string }> => {
    const { email, password, location, ...otherData } = userData;

    console.log(`🔍 Checking if user exists: ${email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      throw new CustomError('User with this email already exists', HTTP_STATUS.CONFLICT || 409);
    }

    console.log(`✅ User doesn't exist, proceeding with OTP generation`);

    // Validate GeoJSON location if provided
    if (userData.location && !this.validateGeoLocation(userData.location)) {
      throw new CustomError(
        'Invalid location format. Location must be a valid GeoJSON Point with coordinates [longitude, latitude]',
        HTTP_STATUS.BAD_REQUEST || 400
      );
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds); // Use this.saltRounds

    const tempUserData: CreateUserData = { // Ensure CreateUserData can accept GeoJSON location
      ...otherData,
      email,
      password: hashedPassword,
      location: location as any, // Cast to any or update CreateUserData to include GeoJSON type
    };

    const otp = generateOtp();
    console.log(`🔢 Generated OTP: ${otp} for ${email}`);

    await this.otpRepository.createOtp(email, otp, tempUserData);

    const userName = userData.fullName || undefined; // Simplified userName
    await sendOtpEmail(email, otp, userName);

    console.log(`📧 OTP sent to ${email}`);
    return { email };
  }

  // VERIFY OTP AND COMPLETE REGISTRATION
  async verifyOtpAndCompleteRegistration(email: string, otp: string): Promise<{ user: any; tokens: any }> {
    console.log(`🔍 Verifying OTP for email: ${email}`);
    console.log(`🔢 Received OTP: ${otp}`);

    // Verify OTP
    const verificationResult = await this.otpRepository.verifyOtp(email, otp);
    console.log(`🔍 Verification result:`, verificationResult);

    if (!verificationResult.isValid) {
      if (verificationResult.isExpired) {
        console.log(`⏰ OTP expired for ${email}`);
        throw new CustomError('OTP has expired. Please request a new one.', HTTP_STATUS.BAD_REQUEST || 400);
      }
      if (verificationResult.maxAttemptsReached) {
        console.log(`🚫 Max attempts reached for ${email}`);
        throw new CustomError('Maximum verification attempts reached. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST || 400);
      }
      console.log(`❌ Invalid OTP for ${email}`);
      throw new CustomError('Invalid OTP. Please try again.', HTTP_STATUS.BAD_REQUEST || 400);
    }

    console.log(`✅ OTP verified successfully for ${email}`);

    const userData = verificationResult.userData;
    console.log(`👤 Creating user with data:`, {
      email: userData.email,
      fullName: userData.fullName
    });

    const user = await this.userRepository.createUser(userData);
    console.log(`✅ User created successfully:`, {
      id: user._id || user.id,
      email: user.email
    });

    const tokens = this.generateTokens(
      user._id?.toString() || user.id?.toString(),
      user.email
    );

    console.log(`🎟️ Tokens generated successfully for ${email}`);

    return {
      user: {
        id: user._id?.toString() || user.id?.toString(),
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
      tokens,
    };
  }

  // RESEND OTP - Fixed implementation
  async resendOtp(email: string): Promise<void> {
    console.log(`🔄 Resending OTP for email: ${email}`);

    // Check if there's a pending OTP request
    const existingOtp = await this.otpRepository.findByEmail(email);
    if (!existingOtp) {
      console.log(`❌ No pending verification found for ${email}`);
      throw new CustomError('No pending verification found for this email. Please start registration again.', HTTP_STATUS.BAD_REQUEST || 400);
    }
    const otp = generateOtp();
    console.log(`🔢 Generated new OTP: ${otp} for ${email}`); 

    await this.otpRepository.createOtp(email, otp, existingOtp.userData);

    const userName = existingOtp.userData?.fullName || existingOtp.userData?.name || undefined;
    await sendOtpEmail(email, otp, userName);

    console.log(`📧 New OTP sent to ${email}`);
  }

  // LOGIN
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log("🔧 [AuthService] Starting login process...");

      const normalizedEmail = data.email.trim().toLowerCase();
      const user = await this.userRepository.findByEmail(normalizedEmail);

      if (!user) {
        console.error("❌ [AuthService] No user found with email:", normalizedEmail);
        throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED || 401);
      }

      if (!user.isActive) {
        console.error("❌ [AuthService] User account is inactive:", normalizedEmail);
        throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN || 403);
      }

      console.log("🔐 [AuthService] Verifying password...");
      const isValidPassword = await bcrypt.compare(data.password, user.password);

      if (!isValidPassword) {
        console.error("❌ [AuthService] Password mismatch for user:", normalizedEmail);
        throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED || 401);
      }

      console.log("🎟️ [AuthService] Generating JWT tokens...");
      const tokens = this.jwtService.generateTokens({
        id: user._id.toString(),
        email: user.email,
        role :"user"
      });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage,
          location: user.location,
        },
        tokens,
      };
    } catch (error) {
      console.error("❌ [AuthService] Login error:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', HTTP_STATUS.BAD_REQUEST || 400);
    }
  }

  // GOOGLE LOGIN
  async googleLogin(credential: string): Promise<AuthResponse> {
    try {
      console.log("🔧 [AuthService] Starting Google authentication...");


      const googleUser = await this.googleService.verifyIdToken(credential);
      console.log("✅ [AuthService] Google token verified");

      const normalizedEmail = googleUser.email.trim().toLowerCase();


      let user = await this.userRepository.findByEmail(normalizedEmail);

      if (!user) {
        console.log("📝 [AuthService] Creating new user from Google data...");


        const userData: CreateUserData = {
          fullName: googleUser.name,
          email: normalizedEmail,
          phone: '',
          password: '',
          profileImage: googleUser.picture || undefined,
          isGoogleUser: true,
          googleId: googleUser.id,
          isActive: true,
          location: {
            type: "Point", coordinates: [0, 0]
          }
        };

        user = await this.userRepository.createUser(userData);
        console.log("✅ [AuthService] New Google user created");
      } else {
        console.log("✅ [AuthService] Existing user found");

        // Update Google ID if not set
        if (!user.googleId && user.isGoogleUser) {
          console.log("📝 [AuthService] Updating user with Google ID");
        }
      }

      if (!user.isActive) {
        throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN || 403);
      }

      // Generate JWT tokens
      console.log("🎟️ [AuthService] Generating JWT tokens...");
      const tokens = this.jwtService.generateTokens({
        id: user._id.toString(),
        email: user.email,
        role :"user"
      });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage,
          location: user.location,
        },
        tokens,
      };
    } catch (error) {
      console.error("❌ [AuthService] Google login error:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Google authentication failed', HTTP_STATUS.BAD_REQUEST || 400);
    }
  }

  // REFRESH TOKEN
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      console.log("🔧 [AuthService] Refreshing token...");

      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      if (!payload || typeof payload === 'string') {
        throw new CustomError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED || 401);
      }

      const userId = (payload as JwtPayload).id;
      const user = await this.userRepository.findById(userId);

      if (!user || !user.isActive) {
        throw new CustomError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED || 401);
      }

      const newAccessToken = this.jwtService.generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role :"user"
      });

      console.log("✅ [AuthService] Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("❌ [AuthService] Token refresh error:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Token refresh failed', HTTP_STATUS.UNAUTHORIZED || 401);
    }
  }

  
  async sendResetLink(email: string) {
    try {
      console.log("🔧 [AuthService] Sending reset link for email:", email);

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new CustomError('User not found with this email address', HTTP_STATUS.NOT_FOUND || 404);
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      await this.userRepository.setResetToken(email, token, expires);

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

      const emailContent = PASSWORD_RESET_MAIL_CONTENT(resetLink);
      await this.emailService.sendOtpEmail(email, 'Reset Your Password', emailContent);

      console.log("✅ [AuthService] Reset link sent successfully");
    } catch (error) {
      console.error("❌ [AuthService] Send reset link error:", error);
      throw error instanceof CustomError ? error : new CustomError('Failed to send reset link', HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);
    }
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    try {
      console.log("🔧 [AuthService] Processing password reset with token");

      if (newPassword !== confirmPassword) {
        throw new CustomError('Passwords do not match', HTTP_STATUS.BAD_REQUEST || 400);
      }

      // Validate password strength
      if (newPassword.length < 8) {
        throw new CustomError('Password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST || 400);
      }
      console.log("🧪 Matching token:", token);
      console.log("🧪 Current time:", new Date());

      // Find user by valid token 
      console.log("🔍 Checking reset token:", token);
      const user = await this.userRepository.findByResetToken(token);
      console.log("🔍 Found user for reset token:", user);

      if (!user) {
        throw new CustomError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST || 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await this.userRepository.updatePasswordAndClearToken(user._id, hashedPassword);

      console.log("✅ [AuthService] Password reset successfully");
    } catch (error) {
      console.error("❌ [AuthService] Reset password error:", error);
      throw error instanceof CustomError ? error : new CustomError('Failed to reset password', HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);
    }
  }
}