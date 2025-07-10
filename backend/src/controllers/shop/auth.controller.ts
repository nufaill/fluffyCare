// backend/src/controllers/shop/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../services/shop/auth.service";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../../shared/constant";
import { CustomError } from "../../util/CustomerError";
import { setAuthCookies } from "util/cookie-helper";

const validateGeoJSONPoint = (location: any): boolean => {
  if (!location || typeof location !== 'object') return false;
  if (location.type !== 'Point') return false;
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) return false;

  const [lng, lat] = location.coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') return false;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return false;

  return true;
};

export class ShopAuthController {
  constructor(private readonly authService: AuthService) { }

  // Register shop 
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { location, email, password, name, phone, city, streetAddress, certificateUrl } = req.body;

      if (!email || !password || !name || !phone || !city || !streetAddress || !certificateUrl) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'All required fields must be provided'
        });
        return;
      }
      if (!validateGeoJSONPoint(location)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid location format. Expected GeoJSON Point with coordinates [longitude, latitude]'
        });
        return;
      }

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

  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email and OTP are required',
        });
        return;
      }

      const result = await this.authService.verifyOtpAndCompleteRegistration(email, otp);

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

  public resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
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
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }
      

      const result = await this.authService.login({ email, password });

      if (!result.shop.isVerified) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND,
        });
        return;
      }

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken,'shop')

      

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Login successful",
        shop: {
          id: result.shop.id,
          name: result.shop.name,
          email: result.shop.email,
          phone: result.shop.phone,
          logo: result.shop.logo,
          city: result.shop.city,
          streetAddress: result.shop.streetAddress,
          description: result.shop.description,
          certificateUrl: result.shop.certificateUrl,
          location: result.shop.location,
          isActive: result.shop.isActive,
          isVerified: result.shop.isVerified,
          createdAt: result.shop.createdAt,
          updatedAt: result.shop.updatedAt,
        },
        token: result.tokens.accessToken,
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

  public sendResetLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

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
}