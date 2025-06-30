// backend/src/controllers/shop/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../services/shop/authService";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomError } from "../../util/CustomerError";
import { setAuthCookies } from "util/cookie-helper";

export interface ShopAuthRequest extends Request {
  shop?: {
    id: string;
    email: string;
  };
}

export class ShopAuthController {
  constructor(private readonly authService: AuthService) {}

  // Register shop (initiate registration with OTP)
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("📥 [ShopAuthController] Registration request received");

      const result = await this.authService.register(req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete shop registration.',
        email: result.email,
        otpSent: true,
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Registration failed:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.BAD_REQUEST;

      const message = error instanceof Error ? 
        error.message : 
        "Failed to register shop";

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Verify OTP and complete registration
  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [ShopAuthController] OTP verification request received");

      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email and OTP are required',
        });
        return;
      }

      const result = await this.authService.verifyOtpAndCompleteRegistration(email, otp);

      // Return tokens in response body instead of cookies
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Email verified successfully! Your shop account has been created.',
        shop: result.shop,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        }
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] OTP verification error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.BAD_REQUEST;

      const message = error instanceof Error ? 
        error.message : 
        'OTP verification failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Resend OTP
  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [ShopAuthController] Resend OTP request received");

      const { email } = req.body;

      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this.authService.resendOtp(email);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'New OTP sent to your email',
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Resend OTP error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.BAD_REQUEST;

      const message = error instanceof Error ? 
        error.message : 
        'Failed to resend OTP';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Shop login
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [ShopAuthController] Login request received");

      const { email, password } = req.body;

      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await this.authService.login({ email, password });

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken)

      // Return tokens in response body instead of cookies
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Login successful",
        shop: result.shop,
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Login failed:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.UNAUTHORIZED;

      const message = error instanceof Error ? 
        error.message : 
        "Login failed";

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Refresh token
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      console.log("🔧 [ShopAuthController] Refreshing token...");
      const newAccessToken = await this.authService.refreshToken(refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Token refresh error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.UNAUTHORIZED;

      const message = error instanceof Error ? 
        error.message : 
        'Token refresh failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Send password reset link
  public sendResetLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("🔧 [ShopAuthController] Send reset link request received");

      const { email } = req.body;

      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this.authService.sendResetLink(email);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OTP_SEND_SUCCESS || 'Reset link sent successfully'
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Send reset link error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.BAD_REQUEST;

      const message = error instanceof Error ? 
        error.message : 
        'Failed to send reset link';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Reset password
  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("🔧 [ShopAuthController] Reset password request received");

      const { token, password, confirmPassword } = req.body;

      if (!token || !password || !confirmPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Token, password, and confirm password are required',
        });
        return;
      }

      await this.authService.resetPassword(token, password, confirmPassword);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS || 'Password reset successful'
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Reset password error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        HTTP_STATUS.BAD_REQUEST;

      const message = error instanceof Error ? 
        error.message : 
        'Password reset failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Logout
  public logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [ShopAuthController] Logout request received");

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Logout error:", error);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Logout failed",
      });
    }
  };

  // Get current shop details
  public me = async (req: ShopAuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.shop) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Shop not authenticated',
        });
        return;
      }

      console.log("🔧 [ShopAuthController] Fetching shop profile...");

      const shop = await this.authService.getShopById(req.shop.id);

      if (!shop) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Shop not found',
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
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
      });
    } catch (error) {
      console.error("❌ [ShopAuthController] Profile fetch error:", error);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to get shop info",
      });
    }
  };
}