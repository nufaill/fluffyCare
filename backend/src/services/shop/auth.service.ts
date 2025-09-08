import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Types } from 'mongoose';
import IShopRepository from '../../interfaces/repositoryInterfaces/IShopRepository';
import { IJwtService } from '../../interfaces/serviceInterfaces/IJwtService';
import { IEmailService } from '../../interfaces/serviceInterfaces/IEmailService';
import { IOtpRepository } from '../../interfaces/repositoryInterfaces/IOtpRepository';
import { TokenPair, CreateShopData, ShopDocument, ShopAuthResponse, GeoLocation } from '../../types/Shop.types';
import { ShopJwtPayload } from 'types/jwt.types';
import { HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { generateOtp, sendOtpEmail } from '../../util/sendOtp';
import PASSWORD_RESET_MAIL_CONTENT from '../../shared/mailTemplate';
import { CreateShopDTO, LoginUserDTO, VerifyOtpDTO, ResendOtpDTO, ResetPasswordDTO, SendResetLinkDTO } from '../../dto/auth.dto';
import { IShopAuthService } from '../../interfaces/serviceInterfaces/IAuthService';
import { ShopResponseDTO } from '../../dto/shop.dto';

class GeoLocationValidator {
  validate(location: GeoLocation): location is GeoLocation {
    if (!location || typeof location !== 'object') {
      throw new CustomError('Location is required', HTTP_STATUS.BAD_REQUEST);
    }

    if (location.type !== 'Point') {
      throw new CustomError('Location must be a GeoJSON Point', HTTP_STATUS.BAD_REQUEST);
    }

    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      throw new CustomError('Location coordinates must be an array of [longitude, latitude]', HTTP_STATUS.BAD_REQUEST);
    }

    const [lng, lat] = location.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      throw new CustomError('Location coordinates must be numbers', HTTP_STATUS.BAD_REQUEST);
    }

    if (lng < -180 || lng > 180) {
      throw new CustomError('Longitude must be between -180 and 180', HTTP_STATUS.BAD_REQUEST);
    }

    if (lat < -90 || lat > 90) {
      throw new CustomError('Latitude must be between -90 and 90', HTTP_STATUS.BAD_REQUEST);
    }

    return true;
  }
}

export class AuthService implements IShopAuthService {
  private readonly _saltRounds = 12;
  private readonly _geoValidator: GeoLocationValidator;

  constructor(
    private readonly _shopRepository: IShopRepository,
    private readonly _jwtService: IJwtService,
    private readonly _emailService: IEmailService,
    private readonly _otpRepository: IOtpRepository
  ) {
    this._geoValidator = new GeoLocationValidator();
  }

  private _generateTokens(id: string, email: string): TokenPair {
    return this._jwtService.generateTokens({
      id,
      email,
      role: 'shop',
    });
  }

  async register(shopData: CreateShopDTO): Promise<{ email: string }> {
    const { email, password, location, ...otherData } = shopData;

    if (!location) {
      throw new CustomError('Location is required', HTTP_STATUS.BAD_REQUEST);
    }
    this._geoValidator.validate(location);

    const existingShop = await this._shopRepository.findByEmail(email);
    if (existingShop) {
      console.log(`❌ [AuthService] Shop already exists: ${email}`);
      throw new CustomError('Shop with this email already exists', HTTP_STATUS.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(password, this._saltRounds);
    const tempShopData: CreateShopData = {
      ...otherData,
      email,
      password: hashedPassword,
      location: {
        type: 'Point',
        coordinates: [location.coordinates[0], location.coordinates[1]],
      },
      isActive: true,
      isVerified: 'pending',
    };

    const otp = generateOtp();
    console.log(`🔢 [AuthService] Generated OTP: ${otp} for ${email}`);
    await this._otpRepository.createOtp(email, otp, tempShopData);

    const shopName = shopData.name;
    await sendOtpEmail(email, otp, shopName);

    console.log(`📧 [AuthService] OTP sent to ${email}`);
    return { email };
  }

  async verifyOtpAndCompleteRegistration(data: VerifyOtpDTO): Promise<ShopAuthResponse> {
    const { email, otp } = data;
    console.log(`🔍 [AuthService] Verifying OTP for email: ${email}`);

    const verificationResult = await this._otpRepository.verifyOtp(email, otp);

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

    console.log(`✅ [AuthService] OTP verified successfully for ${email}`);
    const shopData = verificationResult.userData as unknown as CreateShopData;

    if (shopData.location) {
      this._geoValidator.validate(shopData.location);
    }

    console.log(`🏪 [AuthService] Creating shop with data:`, {
      email: shopData.email,
      name: shopData.name,
      location: shopData.location,
    });

    const shop = await this._shopRepository.createShop({ ...shopData, isVerified: 'pending' });
    console.log(`✅ [AuthService] Shop created successfully:`, {
      id: shop.id,
      email: shop.email,
    });

    const tokens = this._generateTokens(shop.id, shop.email);

    console.log(`🎟️ [AuthService] Tokens generated successfully for ${email}`);

    return {
      success: true,
      shop: {
        id: shop.id,
        name: shop.name,
        email: shop.email,
        phone: shop.phone,
        logo: shop.logo ?? '',
        city: shop.city ?? '',
        streetAddress: shop.streetAddress ?? '',
        description: shop.description,
        certificateUrl: shop.certificateUrl ?? '',
        location: shop.location ?? { type: 'Point', coordinates: [0, 0] },
        isActive: shop.isActive,
        isVerified: shop.isVerified,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      },
      tokens,
    };
  }

  async resendOtp(data: ResendOtpDTO): Promise<void> {
    const { email } = data;
    console.log(`🔄 [AuthService] Resending OTP for email: ${email}`);

    const existingOtp = await this._otpRepository.findByEmail(email);
    if (!existingOtp) {
      console.log(`❌ [AuthService] No pending verification found for ${email}`);
      throw new CustomError('No pending verification found for this email. Please start registration again.', HTTP_STATUS.BAD_REQUEST);
    }

    console.log(`✅ [AuthService] Found existing OTP record for ${email}`);

    const userData = existingOtp.userData as unknown as CreateShopData;
    if (!userData.location) {
      throw new CustomError('Location data missing in OTP record', HTTP_STATUS.BAD_REQUEST);
    }
    this._geoValidator.validate(userData.location);

    const otp = generateOtp();
    console.log(`🔢 [AuthService] Generated new OTP for ${email}`);

    await this._otpRepository.createOtp(email, otp, existingOtp.userData);

    const shopName = userData?.name || 'Shop';
    await sendOtpEmail(email, otp, shopName);

    console.log(`📧 [AuthService] New OTP sent to ${email}`);
  }

  async login(data: LoginUserDTO): Promise<ShopAuthResponse> {
    try {
      console.log('🔧 [AuthService] Starting login process...');

      const normalizedEmail = data.email.trim().toLowerCase();
      const shop = await this._shopRepository.findByEmailWithPassword(normalizedEmail);

      if (!shop) {
        console.error('❌ [AuthService] No shop found with email:', normalizedEmail);
        throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!shop.isActive) {
        console.error('❌ [AuthService] Shop account is inactive:', normalizedEmail);
        throw new CustomError('Shop account is inactive', HTTP_STATUS.FORBIDDEN);
      }

      // if (shop.isVerified !== 'approved') {
      //   console.error('❌ [AuthService] Shop not approved:', normalizedEmail);
      //   throw new CustomError('Shop account is not approved', HTTP_STATUS.FORBIDDEN);
      // }

      console.log('🔐 [AuthService] Verifying password...');
      const isValidPassword = await bcrypt.compare(data.password, shop.password);

      if (!isValidPassword) {
        console.error('❌ [AuthService] Password mismatch for shop:', normalizedEmail);
        throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
      }

      console.log('🎟️ [AuthService] Generating JWT tokens...');
      const tokens = this._generateTokens(shop.id, shop.email);

      return {
        success: true,
        shop: {
          id: shop.id,
          name: shop.name,
          email: shop.email,
          phone: shop.phone,
          logo: shop.logo ?? '',
          city: shop.city ?? '',
          streetAddress: shop.streetAddress ?? '',
          description: shop.description,
          certificateUrl: shop.certificateUrl ?? '',
          location: shop.location ?? { type: 'Point', coordinates: [0, 0] },
          isActive: shop.isActive,
          isVerified: shop.isVerified,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        },
        tokens,
      };
    } catch (error) {
      console.error('❌ [AuthService] Login error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', HTTP_STATUS.BAD_REQUEST);
    }
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      console.log('🔧 [AuthService] Refreshing token...');

      const payload = this._jwtService.verifyRefreshToken(refreshToken);

      if (!payload || typeof payload === 'string') {
        throw new CustomError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
      }

      const shopId = (payload as ShopJwtPayload).id;
      const shop = await this._shopRepository.findById(shopId);

      if (!shop || !shop.isActive) {
        throw new CustomError('Shop not found or inactive', HTTP_STATUS.UNAUTHORIZED);
      }

      // if (shop.isVerified !== 'approved') {
      //   throw new CustomError('Shop not approved', HTTP_STATUS.UNAUTHORIZED);
      // }

      const newAccessToken = this._jwtService.generateAccessToken({
        id: shop.id,
        email: shop.email,
        role: 'shop',
      });

      console.log('✅ [AuthService] Token refreshed successfully');
      return newAccessToken;
    } catch (error) {
      console.error('❌ [AuthService] Token refresh error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Token refresh failed', HTTP_STATUS.UNAUTHORIZED);
    }
  }

  async sendResetLink(data: SendResetLinkDTO): Promise<void> {
    try {
      const { email } = data;
      console.log('🔧 [AuthService] Sending reset link for email:', email);

      const shop = await this._shopRepository.findByEmail(email);
      if (!shop) {
        throw new CustomError('Shop not found with this email address', HTTP_STATUS.NOT_FOUND);
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      await this._shopRepository.setResetToken(email, token, expires);

      const resetLink = `${process.env.CLIENT_URL}/shop/reset-password?token=${token}`;

      const emailContent = PASSWORD_RESET_MAIL_CONTENT(resetLink);
      await this._emailService.sendOtpEmail(email, 'Reset Your Shop Password', emailContent);

      console.log('✅ [AuthService] Reset link sent successfully');
    } catch (error) {
      console.error('❌ [AuthService] Send reset link error:', error);
      throw error instanceof CustomError ? error : new CustomError('Failed to send reset link', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    try {
      const { token, password, confirmPassword } = data;
      console.log('🔧 [AuthService] Processing password reset with token');

      if (password !== confirmPassword) {
        throw new CustomError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
      }

      if (password.length < 8) {
        throw new CustomError('Password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST);
      }

      console.log('🔍 [AuthService] Checking reset token:', token);
      const shop = await this._shopRepository.findByResetToken(token);

      if (!shop) {
        throw new CustomError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, this._saltRounds);

      await this._shopRepository.updatePasswordAndClearToken(new Types.ObjectId(shop.id), hashedPassword);

      console.log('✅ [AuthService] Password reset successfully');
    } catch (error) {
      console.error('❌ [AuthService] Reset password error:', error);
      throw error instanceof CustomError ? error : new CustomError('Failed to reset password', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getShopById(id: string): Promise<ShopResponseDTO | null> {
    try {
      console.log('🔧 [AuthService] Fetching shop by ID:', id);

      const shop = await this._shopRepository.findById(id);
      if (!shop) {
        return null;
      }

      return shop;
    } catch (error) {
      console.error('❌ [AuthService] Get shop by ID error:', error);
      throw new CustomError('Failed to fetch shop profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}