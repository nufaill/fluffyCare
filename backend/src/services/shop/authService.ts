// backend/src/services/shop/authService.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ShopRepository } from '../../repositories/shopRepository';
import { JwtService } from '../jwt/jwtService';
import { EmailService } from '../emailService/emailService';
import { OtpRepository } from '../../repositories/otpRepository';
import { 
  CreateShopData, 
  ShopDocument, 
  ShopLoginData, 
  ShopRegisterData, 
  ShopAuthResponse,
  TokenPair,
  ShopProfile,
  GeoLocation
} from '../../types/Shop.types';
import { JwtPayload } from '../../types/auth.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { generateOtp, sendOtpEmail } from '../../util/sendOtp';
import PASSWORD_RESET_MAIL_CONTENT from '../../shared/mailTemplate';

export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly shopRepository: ShopRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly otpRepository: OtpRepository
  ) {}

  // VALIDATE GEOJSON POINT
  private validateGeoLocation(location: any): location is GeoLocation {
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

  // GENERATE TOKENS
  private generateTokens(id: string, email: string): TokenPair {
    return this.jwtService.generateTokens({
      id,
      email
    });
  }

  // REGISTER SHOP WITH OTP
  async register(shopData: ShopRegisterData): Promise<{ email: string }> {
    const { email, password, location, ...otherData } = shopData;

    console.log(`🔍 [ShopAuthService] Checking if shop exists: ${email}`);

    // Validate GeoJSON location
    this.validateGeoLocation(location);
    console.log(`✅ [ShopAuthService] Location validation passed:`, location);

    // Check if shop already exists
    const existingShop = await this.shopRepository.findByEmail(email);
    if (existingShop) {
      console.log(`❌ [ShopAuthService] Shop already exists: ${email}`);
      throw new CustomError('Shop with this email already exists', HTTP_STATUS.CONFLICT);
    }

    console.log(`✅ [ShopAuthService] Shop doesn't exist, proceeding with OTP generation`);

    // Hash password before storing in temporary data
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const tempShopData: CreateShopData = {
      ...otherData,
      email,
      password: hashedPassword,
      location: {
        type: 'Point',
        coordinates: [location.coordinates[0], location.coordinates[1]]
      },
      isActive: true,
      isVerified: false,
    };

    // Generate and send OTP
    const otp = generateOtp();
    console.log(`🔢 [ShopAuthService] Generated OTP: ${otp} for ${email}`);

    await this.otpRepository.createOtp(email, otp, tempShopData);

    // Send OTP email
    const shopName = shopData.name;
    await sendOtpEmail(email, otp, shopName);

    console.log(`📧 [ShopAuthService] OTP sent to ${email}`);
    return { email };
  }

  // VERIFY OTP AND COMPLETE REGISTRATION
  async verifyOtpAndCompleteRegistration(email: string, otp: string): Promise<ShopAuthResponse> {
    console.log(`🔍 [ShopAuthService] Verifying OTP for email: ${email}`);

    // Verify OTP
    const verificationResult = await this.otpRepository.verifyOtp(email, otp);

    if (!verificationResult.isValid) {
      if (verificationResult.isExpired) {
        console.log(`⏰ [ShopAuthService] OTP expired for ${email}`);
        throw new CustomError('OTP has expired. Please request a new one.', HTTP_STATUS.BAD_REQUEST);
      }
      if (verificationResult.maxAttemptsReached) {
        console.log(`🚫 [ShopAuthService] Max attempts reached for ${email}`);
        throw new CustomError('Maximum verification attempts reached. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
      }
      console.log(`❌ [ShopAuthService] Invalid OTP for ${email}`);
      throw new CustomError('Invalid OTP. Please try again.', HTTP_STATUS.BAD_REQUEST);
    }

    console.log(`✅ [ShopAuthService] OTP verified successfully for ${email}`);

    // Create shop with the stored data
    const shopData = verificationResult.userData as CreateShopData;
    
    // Ensure location is in correct GeoJSON format
    if (shopData.location) {
      this.validateGeoLocation(shopData.location);
    }
    
    console.log(`🏪 [ShopAuthService] Creating shop with data:`, {
      email: shopData.email,
      name: shopData.name,
      location: shopData.location
    });

    const shop = await this.shopRepository.createShop(shopData);
    console.log(`✅ [ShopAuthService] Shop created successfully:`, {
      id: shop._id?.toString(),
      email: shop.email
    });

    // Generate tokens
    const tokens = this.generateTokens(
      shop._id?.toString() || shop.id?.toString(),
      shop.email
    );

    console.log(`🎟️ [ShopAuthService] Tokens generated successfully for ${email}`);

    return {
      success: true,
      shop: {
        id: shop._id?.toString() || shop.id?.toString(),
        name: shop.name,
        email: shop.email,
        phone: shop.phone,
        logo: shop.logo,
        city: shop.city,
        streetAddress: shop.streetAddress,
        description: shop.description,
        certificateUrl: shop.certificateUrl,
        location: shop.location,
        isActive: shop.isActive,
        isVerified: shop.isVerified,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      },
      tokens,
    };
  }

  // RESEND OTP
  async resendOtp(email: string): Promise<void> {
    console.log(`🔄 [ShopAuthService] Resending OTP for email: ${email}`);

    const existingOtp = await this.otpRepository.findByEmail(email);
    if (!existingOtp) {
      console.log(`❌ [ShopAuthService] No pending verification found for ${email}`);
      throw new CustomError('No pending verification found for this email. Please start registration again.', HTTP_STATUS.BAD_REQUEST);
    }

    console.log(`✅ [ShopAuthService] Found existing OTP record for ${email}`);

    // Validate existing location data
    const userData = existingOtp.userData as CreateShopData;
    if (userData.location) {
      this.validateGeoLocation(userData.location);
    }

    // Generate new OTP
    const otp = generateOtp();
    console.log(`🔢 [ShopAuthService] Generated new OTP for ${email}`);

    await this.otpRepository.createOtp(email, otp, existingOtp.userData);

    // Send new OTP email
    const shopName = userData?.name || 'Shop';
    await sendOtpEmail(email, otp, shopName);

    console.log(`📧 [ShopAuthService] New OTP sent to ${email}`);
  }

  // LOGIN
  async login(data: ShopLoginData): Promise<ShopAuthResponse> {
    try {
      console.log("🔧 [ShopAuthService] Starting login process...");

      const normalizedEmail = data.email.trim().toLowerCase();
      const shop = await this.shopRepository.findByEmail(normalizedEmail);

      if (!shop) {
        console.error("❌ [ShopAuthService] No shop found with email:", normalizedEmail);
        throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!shop.isActive) {
        console.error("❌ [ShopAuthService] Shop account is inactive:", normalizedEmail);
        throw new CustomError('Shop account is inactive', HTTP_STATUS.FORBIDDEN);
      }

      console.log("🔐 [ShopAuthService] Verifying password...");
      const isValidPassword = await bcrypt.compare(data.password, shop.password);

      if (!isValidPassword) {
        console.error("❌ [ShopAuthService] Password mismatch for shop:", normalizedEmail);
        throw new CustomError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
      }

      console.log("🎟️ [ShopAuthService] Generating JWT tokens...");
      const tokens = this.generateTokens(shop._id.toString(), shop.email);

      return {
        success: true,
        shop: {
          id: shop._id.toString(),
          name: shop.name,
          email: shop.email,
          phone: shop.phone,
          logo: shop.logo,
          city: shop.city,
          streetAddress: shop.streetAddress,
          description: shop.description,
          certificateUrl: shop.certificateUrl,
          location: shop.location,
          isActive: shop.isActive,
          isVerified: shop.isVerified,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
        },
        tokens,
      };
    } catch (error) {
      console.error("❌ [ShopAuthService] Login error:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', HTTP_STATUS.BAD_REQUEST);
    }
  }

  // REFRESH TOKEN
  async refreshToken(refreshToken: string): Promise<string> {
    try {
      console.log("🔧 [ShopAuthService] Refreshing token...");

      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      if (!payload || typeof payload === 'string') {
        throw new CustomError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED);
      }

      const shopId = (payload as JwtPayload).id;
      const shop = await this.shopRepository.findById(shopId);

      if (!shop || !shop.isActive) {
        throw new CustomError('Shop not found or inactive', HTTP_STATUS.UNAUTHORIZED);
      }

      const newAccessToken = this.jwtService.generateAccessToken({
        id: shop._id.toString(),
        email: shop.email,
      });

      console.log("✅ [ShopAuthService] Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("❌ [ShopAuthService] Token refresh error:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Token refresh failed', HTTP_STATUS.UNAUTHORIZED);
    }
  }

  // SEND RESET LINK
  async sendResetLink(email: string): Promise<void> {
    try {
      console.log("🔧 [ShopAuthService] Sending reset link for email:", email);

      const shop = await this.shopRepository.findByEmail(email);
      if (!shop) {
        throw new CustomError('Shop not found with this email address', HTTP_STATUS.NOT_FOUND);
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      await this.shopRepository.setResetToken(email, token, expires);

      const resetLink = `${process.env.CLIENT_URL}/shop/reset-password?token=${token}`;

      const emailContent = PASSWORD_RESET_MAIL_CONTENT(resetLink);
      await this.emailService.sendOtpEmail(email, 'Reset Your Shop Password', emailContent);

      console.log("✅ [ShopAuthService] Reset link sent successfully");
    } catch (error) {
      console.error("❌ [ShopAuthService] Send reset link error:", error);
      throw error instanceof CustomError ? error : new CustomError('Failed to send reset link', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // RESET PASSWORD
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      console.log("🔧 [ShopAuthService] Processing password reset with token");

      if (newPassword !== confirmPassword) {
        throw new CustomError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
      }

      if (newPassword.length < 8) {
        throw new CustomError('Password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST);
      }

      console.log("🔍 [ShopAuthService] Checking reset token:", token);
      const shop = await this.shopRepository.findByResetToken(token);

      if (!shop) {
        throw new CustomError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      await this.shopRepository.updatePasswordAndClearToken(shop._id, hashedPassword);

      console.log("✅ [ShopAuthService] Password reset successfully");
    } catch (error) {
      console.error("❌ [ShopAuthService] Reset password error:", error);
      throw error instanceof CustomError ? error : new CustomError('Failed to reset password', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getShopById(id: string): Promise<Omit<ShopDocument, 'password'> | null> {
    try {
      console.log("🔧 [ShopAuthService] Fetching shop by ID:", id);

      const shop = await this.shopRepository.findById(id);
      if (!shop) {
        return null;
      }

      const { password, ...shopWithoutPassword } = shop.toObject();
      return shopWithoutPassword as Omit<ShopDocument, 'password'>;
    } catch (error) {
      console.error("❌ [ShopAuthService] Get shop by ID error:", error);
      throw new CustomError('Failed to fetch shop profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}