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
  ShopProfile
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

  // GENERATE TOKENS
  private generateTokens(id: string, email: string): TokenPair {
    return this.jwtService.generateTokens({
      id,
      email
    });
  }

  // REGISTER SHOP WITH OTP
  async register(shopData: ShopRegisterData): Promise<{ email: string }> {
    const { email, password, ...otherData } = shopData;

    console.log(`🔍 [ShopAuthService] Checking if shop exists: ${email}`);

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
      isActive: true,
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
    console.log(`🏪 [ShopAuthService] Creating shop with data:`, {
      email: shopData.email,
      name: shopData.name
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
        buildingNumber: shop.buildingNumber,
        description: shop.description,
        certificateUrl: shop.certificateUrl,
        location: shop.location,
        isActive: shop.isActive,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
      },
      tokens,
    };
  }

  // RESEND OTP
  async resendOtp(email: string): Promise<void> {
    console.log(`🔄 [ShopAuthService] Resending OTP for email: ${email}`);

    // Check if there's a pending OTP request
    const existingOtp = await this.otpRepository.findByEmail(email);
    if (!existingOtp) {
      console.log(`❌ [ShopAuthService] No pending verification found for ${email}`);
      throw new CustomError('No pending verification found for this email. Please start registration again.', HTTP_STATUS.BAD_REQUEST);
    }

    console.log(`✅ [ShopAuthService] Found existing OTP record for ${email}`);

    // Generate new OTP
    const otp = generateOtp();
    console.log(`🔢 [ShopAuthService] Generated new OTP for ${email}`);

    await this.otpRepository.createOtp(email, otp, existingOtp.userData);

    // Send new OTP email
    const shopName = (existingOtp.userData as CreateShopData)?.name || 'Shop';
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
          buildingNumber: shop.buildingNumber,
          description: shop.description,
          certificateUrl: shop.certificateUrl,
          location: shop.location,
          isActive: shop.isActive,
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

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await this.shopRepository.setResetToken(email, token, expires);

      // Create reset link
      const resetLink = `${process.env.CLIENT_URL}/shop/reset-password?token=${token}`;

      // Send email
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

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new CustomError('Passwords do not match', HTTP_STATUS.BAD_REQUEST);
      }

      // Validate password strength
      if (newPassword.length < 8) {
        throw new CustomError('Password must be at least 8 characters long', HTTP_STATUS.BAD_REQUEST);
      }

      // Find shop by valid token
      console.log("🔍 [ShopAuthService] Checking reset token:", token);
      const shop = await this.shopRepository.findByResetToken(token);

      if (!shop) {
        throw new CustomError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password and clear reset token
      await this.shopRepository.updatePasswordAndClearToken(shop._id, hashedPassword);

      console.log("✅ [ShopAuthService] Password reset successfully");
    } catch (error) {
      console.error("❌ [ShopAuthService] Reset password error:", error);
      throw error instanceof CustomError ? error : new CustomError('Failed to reset password', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // GET SHOP BY ID (for profile/me endpoint)
  async getShopById(id: string): Promise<Omit<ShopDocument, 'password'> | null> {
    try {
      console.log("🔧 [ShopAuthService] Fetching shop by ID:", id);

      const shop = await this.shopRepository.findById(id);
      if (!shop) {
        return null;
      }

      // Remove password from the response
      const { password, ...shopWithoutPassword } = shop.toObject();
      return shopWithoutPassword as Omit<ShopDocument, 'password'>;
    } catch (error) {
      console.error("❌ [ShopAuthService] Get shop by ID error:", error);
      throw new CustomError('Failed to fetch shop profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}