import { Request, Response } from 'express';
import { IShopAuthService } from '../../interfaces/serviceInterfaces/IAuthService';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { setAuthCookies } from '../../util/cookie-helper';
import { CreateShopDTO, LoginUserDTO, VerifyOtpDTO, ResendOtpDTO, ResetPasswordDTO, SendResetLinkDTO } from '../../dto/auth.dto';

export class ShopAuthController {
  constructor(private readonly _authService: IShopAuthService) {}

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const shopData: CreateShopDTO = req.body;

      const { email, password, name, phone, city, streetAddress, certificateUrl, location } = shopData;
      if (!email || !password || !name || !phone || !city || !streetAddress || !certificateUrl || !location) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'All required fields (email, password, name, phone, city, streetAddress, certificateUrl, location) must be provided',
        });
        return;
      }

      if (location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid location format. Expected GeoJSON Point with coordinates [longitude, latitude]',
        });
        return;
      }
      const [lng, lat] = location.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid location coordinates. Must be numbers with longitude between -180 and 180, latitude between -90 and 90',
        });
        return;
      }

      const result = await this._authService.register(shopData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete shop registration.',
        email: result.email,
        otpSent: true,
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] Registration failed:', error);
      this._handleError(res, error, 'Failed to register shop');
    }
  }

  public async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const verifyData: VerifyOtpDTO = req.body;

      if (!verifyData.email || !verifyData.otp) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email and OTP are required',
        });
        return;
      }

      const result = await this._authService.verifyOtpAndCompleteRegistration(verifyData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Email verified successfully! Your shop account has been created.',
        shop: result.shop,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] OTP verification error:', error);
      this._handleError(res, error, 'OTP verification failed');
    }
  }

  public async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const resendData: ResendOtpDTO = req.body;

      if (!resendData.email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this._authService.resendOtp(resendData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'New OTP sent to your email',
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] Resend OTP error:', error);
      this._handleError(res, error, 'Failed to resend OTP');
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginUserDTO = req.body;

      if (!loginData.email || !loginData.password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this._authService.login(loginData);

      if (result.shop.isVerified.status !=='approved') {
        res.status(HTTP_STATUS.OK).json({
          success: false,
          message: ERROR_MESSAGES.NOT_ALLOWED,
        });
        return;
      }

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful',
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
      console.error('❌ [ShopAuthController] Login failed:', error);
      this._handleError(res, error, 'Login failed', HTTP_STATUS.UNAUTHORIZED);
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const newAccessToken = await this._authService.refreshToken(refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] Token refresh error:', error);
      this._handleError(res, error, 'Token refresh failed', HTTP_STATUS.UNAUTHORIZED);
    }
  }

  public async sendResetLink(req: Request, res: Response): Promise<void> {
    try {
      const resetLinkData: SendResetLinkDTO = req.body;

      if (!resetLinkData.email) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this._authService.sendResetLink(resetLinkData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OTP_SEND_SUCCESS,
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] Send reset link error:', error);
      this._handleError(res, error, 'Failed to send reset link');
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const resetData: ResetPasswordDTO = req.body;

      if (!resetData.token || !resetData.password || !resetData.confirmPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Token, password, and confirm password are required',
        });
        return;
      }

      await this._authService.resetPassword(resetData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] Reset password error:', error);
      this._handleError(res, error, 'Password reset failed');
    }
  }

  public async logout(_req: Request, res: Response): Promise<void> {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('❌ [ShopAuthController] Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  private _handleError(res: Response, error: unknown, defaultMessage: string, defaultStatus: number = HTTP_STATUS.BAD_REQUEST): void {
    const statusCode = error instanceof CustomError ? error.statusCode : defaultStatus;
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}