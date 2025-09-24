import bcrypt from 'bcrypt';
import IUserRepository from '../../interfaces/repositoryInterfaces/IUserRepository';
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
    private _userRepository: IUserRepository,
    private _jwtService: JwtService,
    private _googleService: GoogleAuthService,
    private _emailService: EmailService,
    private _otpRepository: OtpRepository
  ) { }

  generateTokens(id: string, email: string) {
    return this._jwtService.generateTokens({ id, email });
  }

  async register(userData: RegisterUserDTO): Promise<{ email: string }> {
    const existingUser = await this._userRepository.findByEmail(userData.email);
    if (existingUser) {
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
    await this._otpRepository.createOtp(userData.email, otp, tempUserData);
    await sendOtpEmail(userData.email, otp, userData.fullName);
    return { email: userData.email };
  }

  async verifyOtpAndCompleteRegistration(data: { email: string; otp: string }): Promise<AuthResponse> {
    const { email, otp } = data;
    const verificationResult = await this._otpRepository.verifyOtp(email, otp);
    if (!verificationResult.isValid) {
      if (verificationResult.isExpired) {
        throw new CustomError('OTP has expired. Please request a new one.', HTTP_STATUS.BAD_REQUEST);
      }
      if (verificationResult.maxAttemptsReached) {
        throw new CustomError('Maximum verification attempts reached. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
      }
      throw new CustomError('Invalid OTP. Please try again.', HTTP_STATUS.BAD_REQUEST);
    }
    const userData = verificationResult.userData!;
    const user = await this._userRepository.createUser(userData);
    const tokens = this.generateTokens(user.id, user.email);
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
    const existingOtp = await this._otpRepository.findByEmail(email);
    if (!existingOtp) {
      throw new CustomError('No pending verification found for this email. Please start registration again.', HTTP_STATUS.BAD_REQUEST);
    }
    const otp = generateOtp();
    await this._otpRepository.createOtp(email, otp, existingOtp.userData);
    await sendOtpEmail(email, otp, existingOtp.userData.fullName);
  }

  async login(data: LoginUserDTO): Promise<AuthResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this._userRepository.findByEmailWithPassword(normalizedEmail);
    if (!user) {
      throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
    if (!user.isActive) {
      throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }
    const isValidPassword = await bcrypt.compare(data.password, user.password || '');
    if (!isValidPassword) {
      throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
    const tokens = this.generateTokens(user.id, user.email);
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
    const googleUser = await this._googleService.verifyIdToken(credential);
    const normalizedEmail = googleUser.email.trim().toLowerCase();
    let user = await this._userRepository.findByEmail(normalizedEmail);
    if (!user) {
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
      user = await this._userRepository.createUser(userData);
    }
    if (!user.isActive) {
      throw new CustomError('Account is inactive', HTTP_STATUS.FORBIDDEN);
    }
    const tokens = this.generateTokens(user.id, user.email);
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
    const payload = this._jwtService.verifyRefreshToken(refreshToken);
    if (!payload || typeof payload === 'string') {
      throw new CustomError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
    }
    const user = await this._userRepository.findById((payload as JwtPayload).id);
    if (!user || !user.isActive) {
      throw new CustomError('User not found or inactive', HTTP_STATUS.UNAUTHORIZED);
    }
    const newAccessToken = this._jwtService.generateAccessToken({
      id: user.id,
      email: user.email
    });
    return newAccessToken;
  }

  async sendResetLink(data: { email: string }): Promise<void> {
    const { email } = data;
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError('User not found with this email address', HTTP_STATUS.NOT_FOUND);
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await this._userRepository.setResetToken(email, token, expires);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const emailContent = PASSWORD_RESET_MAIL_CONTENT(resetLink);
    await this._emailService.sendOtpEmail(email, 'Reset Your Password', emailContent);
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const { token, password: newPassword, confirmPassword } = data;
    if (newPassword !== confirmPassword) {
      throw new CustomError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
    }
    if (newPassword.length < 8) {
      throw new CustomError('Password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST);
    }
    const user = await this._userRepository.findByResetToken(token);
    if (!user) {
      throw new CustomError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await this._userRepository.updatePasswordAndClearToken(new Types.ObjectId(user.id), hashedPassword);
  }
}