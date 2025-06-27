// backend/src/services/user/authService.ts
import bcrypt from 'bcrypt';
import { UserRepository } from '../../repositories/userRepository';
import { JwtService } from '../jwt/jwtService';
import { GoogleAuthService } from '../googleAuth/googleService';
import { AuthResponse, JwtPayload } from '../../types/auth.types';
import { CreateUserData } from '../../types/User.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from "../../util/CustomerError";
import { generateOtp, sendOtpEmail } from 'util/sendOtp';
import { OtpRepository } from 'repositories/otpRepository';
import { sendMail } from '../../util/mailer';
import crypto from 'crypto';
import { config } from '../../config/env';
import { EmailService } from '../emailService/emailService';
import PASSWORD_RESET_MAIL_CONTENT from 'shared/mailTemplate';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location?: Record<string, unknown>;
}

export class AuthService {
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

  // GENERATE TOKENS - Fixed implementation
  generateTokens(id: string, email: string) {
    return this.jwtService.generateTokens({
      id,
      email
    });
  }

  // REGISTER
  async register(userData: any): Promise<{ email: string }> {
    const { email, password, ...otherData } = userData;

    console.log(`🔍 Checking if user exists: ${email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      throw new CustomError('User with this email already exists', HTTP_STATUS.CONFLICT || 409);
    }

    console.log(`✅ User doesn't exist, proceeding with OTP generation`);

    // Hash password before storing in temporary data
    const hashedPassword = await bcrypt.hash(password, 12);
    const tempUserData = {
      ...otherData,
      email,
      password: hashedPassword,
    };

    // Generate and send OTP
    const otp = generateOtp();
    console.log(`🔢 Generated OTP: ${otp} for ${email}`);

    await this.otpRepository.createOtp(email, otp, tempUserData);

    // Send OTP email
    const userName = userData.fullName || userData.name || undefined;
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

    // Create user with the stored data
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

    // Generate tokens using the fixed method
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

    console.log(`✅ Found existing OTP record for ${email}`);

    // Generate new OTP
    const otp = generateOtp();
    console.log(`🔢 Generated new OTP: ${otp} for ${email}`); // Remove this in production

    await this.otpRepository.createOtp(email, otp, existingOtp.userData);

    // Send new OTP email
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
        email: user.email
      });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage,
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

      // Verify the Google ID token
      const googleUser = await this.googleService.verifyIdToken(credential);
      console.log("✅ [AuthService] Google token verified");

      const normalizedEmail = googleUser.email.trim().toLowerCase();

      // Check if user already exists
      let user = await this.userRepository.findByEmail(normalizedEmail);

      if (!user) {
        console.log("📝 [AuthService] Creating new user from Google data...");

        // Create new user from Google data
        const userData: CreateUserData = {
          fullName: googleUser.name,
          email: normalizedEmail,
          phone: '', // Google doesn't provide phone by default
          password: '', // No password for Google users
          profileImage: googleUser.picture || undefined,
          isGoogleUser: true,
          googleId: googleUser.id,
          isActive: true,
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
        email: user.email
      });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage,
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
        email: user.email
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

  // Static method for Google login (alternative approach)
  static async googleLogin(credential: string): Promise<AuthResponse> {
    try {
      console.log("🔧 [AuthService Static] Starting Google authentication...");

      // Import services dynamically
      const { GoogleAuthService } = await import('../googleAuth/googleService');
      const { UserRepository } = await import('../../repositories/userRepository');
      const { JwtService } = await import('../jwt/jwtService');

      const googleService = new GoogleAuthService();
      const userRepository = new UserRepository();
      const jwtService = new JwtService();

      // Verify the Google ID token
      const googleUser = await googleService.verifyIdToken(credential);
      console.log("✅ [AuthService Static] Google token verified");

      const normalizedEmail = googleUser.email.trim().toLowerCase();

      // Check if user already exists
      let user = await userRepository.findByEmail(normalizedEmail);

      if (!user) {
        console.log("📝 [AuthService Static] Creating new user from Google data...");

        // Create new user from Google data
        const userData: CreateUserData = {
          fullName: googleUser.name,
          email: normalizedEmail,
          phone: '', // Google doesn't provide phone by default
          password: '', // No password for Google users
          profileImage: googleUser.picture || undefined,
          isGoogleUser: true,
          googleId: googleUser.id,
          isActive: true,
        };

        user = await userRepository.createUser(userData);
        console.log("✅ [AuthService Static] New Google user created");
      } else {
        console.log("✅ [AuthService Static] Existing user found");
      }

      if (!user.isActive) {
        throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN || 403);
      }

      // Generate JWT tokens
      console.log("🎟️ [AuthService Static] Generating JWT tokens...");
      const tokens = jwtService.generateTokens({
        id: user._id.toString(),
        email: user.email
      });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage,
        },
        tokens,
      };
    } catch (error) {
      console.error("❌ [AuthService Static] Google login error:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Google authentication failed', HTTP_STATUS.BAD_REQUEST || 400);
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

      // Save token to database
      await this.userRepository.setResetToken(email, token, expires);

      // Create reset link
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

      // Send email
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

      // Validate passwords match
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