import bcrypt from 'bcrypt';
import { UserRepository } from '../../repositories/user.repository';
import { JwtService } from '../jwt/jwt.service';
import { GoogleAuthService } from '../googleAuth/google.service';
import { AuthResponse, JwtPayload } from '../../types/auth.types';
import { CreateUserDTO, RegisterUserDTO, LoginUserDTO, ResetPasswordDTO } from '../../dto/auth.dto';
import { IUserAuthService } from '../../interfaces/serviceInterfaces/IAuthService';
import { HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { generateOtp, sendOtpEmail } from '../../util/sendOtp';
import { OtpRepository } from '../../repositories/otp.repository';
import { EmailService } from '../emailService/email.service';
import PASSWORD_RESET_MAIL_CONTENT from '../../shared/mailTemplate';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { validateGeoLocation } from '../../validations/geo.validation';

export class AuthService implements IUserAuthService {
  private readonly saltRounds = 12;

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private googleService: GoogleAuthService,
    private emailService: EmailService,
    private otpRepository: OtpRepository
  ) { }

  generateTokens(id: string, email: string) {
    return this.jwtService.generateTokens({ id, email, role: 'user' });
  }

  async register(userData: RegisterUserDTO): Promise<{ email: string }> {
    console.log(`🔍 [AuthService] Checking if user exists: ${userData.email}`);
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      console.log(`❌ [AuthService] User already exists: ${userData.email}`);
      throw new CustomError('User with this email already exists', HTTP_STATUS.CONFLICT);
    }
    if (userData.location && !validateGeoLocation(userData.location)) {
      throw new CustomError(
        'Invalid location format. Location must be a valid GeoJSON Point with coordinates [longitude, latitude]',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);
    const tempUserData: CreateUserDTO = {
      ...userData,
      password: hashedPassword,
      location: userData.location || { type: 'Point', coordinates: [0, 0] },
    };
    const otp = generateOtp();
    console.log(`🔢 [AuthService] Generated OTP for ${userData.email}`);
    await this.otpRepository.createOtp(userData.email, otp, tempUserData);
    await sendOtpEmail(userData.email, otp, userData.fullName);
    console.log(`📧 [AuthService] OTP sent to ${userData.email}`);
    return { email: userData.email };
  }

  async verifyOtpAndCompleteRegistration(data: { email: string; otp: string }): Promise<AuthResponse> {
    const { email, otp } = data;
    console.log(`🔍 [AuthService] Verifying OTP for ${email}`);
    const verificationResult = await this.otpRepository.verifyOtp(email, otp);
    if (!verificationResult.isValid) {
      if (verificationResult.isExpired) {
        console.log(`⏰ [AuthService] OTP expired for ${email}`);
        throw new CustomError('OTP has expired. Please request a new one.', HTTP_STATUS.BAD_REQUEST);
      }
      if (verificationResult.maxAttemptsReached) {
        console.log(`🚫 [AuthService] Max attempts reached for ${email}`);
        throw new CustomError('Maximum verification attempts reached. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
      }
      console.log(`❌ [AuthService] Invalid OTP for ${email}`);
      throw new CustomError('Invalid OTP. Please try again.', HTTP_STATUS.BAD_REQUEST);
    }
    const userData = verificationResult.userData!;
    console.log(`👤 [AuthService] Creating user: ${userData.email}`);
    const user = await this.userRepository.createUser(userData);
    const tokens = this.generateTokens(user.id, user.email);
    console.log(`🎟️ [AuthService] Tokens generated for ${user.email}`);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage ?? '',
        location: user.location ?? { type: 'Point', coordinates: [0, 0] },
      },
      tokens,
    };
  }

  async resendOtp(data: { email: string }): Promise<void> {
    const { email } = data;
    console.log(`🔄 [AuthService] Resending OTP for ${email}`);
    const existingOtp = await this.otpRepository.findByEmail(email);
    if (!existingOtp) {
      console.log(`❌ [AuthService] No pending verification for ${email}`);
      throw new CustomError('No pending verification found for this email. Please start registration again.', HTTP_STATUS.BAD_REQUEST);
    }
    const otp = generateOtp();
    console.log(`🔢 [AuthService] Generated new OTP for ${email}`);
    await this.otpRepository.createOtp(email, otp, existingOtp.userData);
    await sendOtpEmail(email, otp, existingOtp.userData.fullName);
    console.log(`📧 [AuthService] New OTP sent to ${email}`);
  }

  async login(data: LoginUserDTO): Promise<AuthResponse> {
    console.log(`🔧 [AuthService] Starting login for ${data.email}`);
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) {
      console.log(`❌ [AuthService] No user found: ${normalizedEmail}`);
      throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
    if (!user.isActive) {
      console.log(`❌ [AuthService] Inactive account: ${normalizedEmail}`);
      throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }
    const isValidPassword = await bcrypt.compare(data.password, user.password || '');
    if (!isValidPassword) {
      console.log(`❌ [AuthService] Invalid password for ${normalizedEmail}`);
      throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
    const tokens = this.generateTokens(user.id, user.email);
    console.log(`🎟️ [AuthService] Login successful for ${normalizedEmail}`);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage ?? '',
        location: user.location ?? { type: 'Point', coordinates: [0, 0] },
      },
      tokens,
    };
  }

  async googleLogin(credential: string): Promise<AuthResponse> {
    console.log(`🔧 [AuthService] Starting Google login`);
    const googleUser = await this.googleService.verifyIdToken(credential);
    const normalizedEmail = googleUser.email.trim().toLowerCase();
    let user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      console.log(`📝 [AuthService] Creating new Google user: ${normalizedEmail}`);
      const userData: CreateUserDTO = {
        fullName: googleUser.name,
        email: normalizedEmail,
        phone: '',
        password: '',
        profileImage: googleUser.picture || 'https://i.pinimg.com/1200x/ef/0c/19/ef0c19df86ebd3fd36df90f8d664ead6.jpg',
        googleId: googleUser.id,
        isActive: true,
        isGoogleUser: true,
        location: { type: 'Point', coordinates: [0, 0] },
      };
      user = await this.userRepository.createUser(userData);
    }
    if (!user.isActive) {
      console.log(`❌ [AuthService] Inactive Google account: ${normalizedEmail}`);
      throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }
    const tokens = this.generateTokens(user.id, user.email);
    console.log(`🎟️ [AuthService] Google login successful for ${normalizedEmail}`);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage ?? '',
        location: user.location ?? { type: 'Point', coordinates: [0, 0] },
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    console.log(`🔧 [AuthService] Refreshing token`);
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload || typeof payload === 'string') {
      console.log(`❌ [AuthService] Invalid refresh token`);
      throw new CustomError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }
    const user = await this.userRepository.findById((payload as JwtPayload).id);
    if (!user || !user.isActive) {
      console.log(`❌ [AuthService] User not found or inactive`);
      throw new CustomError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED);
    }
    const newAccessToken = this.jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: 'user',
    });
    console.log(`✅ [AuthService] Token refreshed for ${user.email}`);
    return newAccessToken;
  }

  async sendResetLink(data: { email: string }): Promise<void> {
    const { email } = data;
    console.log(`🔧 [AuthService] Sending reset link for ${email}`);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      console.log(`❌ [AuthService] User not found: ${email}`);
      throw new CustomError('User not found with this email address', HTTP_STATUS.NOT_FOUND);
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await this.userRepository.setResetToken(email, token, expires);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const emailContent = PASSWORD_RESET_MAIL_CONTENT(resetLink);
    await this.emailService.sendOtpEmail(email, 'Reset Your Password', emailContent);
    console.log(`✅ [AuthService] Reset link sent to ${email}`);
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const { token, password: newPassword, confirmPassword } = data;
    console.log(`🔧 [AuthService] Processing password reset`);
    if (newPassword !== confirmPassword) {
      console.log(`❌ [AuthService] Passwords do not match`);
      throw new CustomError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
    }
    if (newPassword.length < 8) {
      console.log(`❌ [AuthService] Password too short`);
      throw new CustomError('Password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST);
    }
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      console.log(`❌ [AuthService] Invalid or expired reset token`);
      throw new CustomError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.updatePasswordAndClearToken(new Types.ObjectId(user.id), hashedPassword);
    console.log(`✅ [AuthService] Password reset for ${user.email}`);
  }
}