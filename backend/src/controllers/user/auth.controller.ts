import { Request, Response, NextFunction } from 'express';
import { IAuthController } from '../../interfaces/controllerInterfaces/IAuthController';
import { AuthService } from '../../services/user/auth.service';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { RegisterUserDTO, LoginUserDTO } from '../../dto/auth.dto';

export class AuthController implements IAuthController {
  constructor(private authService: AuthService) { }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: RegisterUserDTO = req.body;
      const result = await this.authService.register(userData);
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
        email: result.email,
        otpSent: true,
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'Failed to send verification email';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Email and OTP are required',
        });
        return;
      }
      const result = await this.authService.verifyOtpAndCompleteRegistration({ email, otp }); // Pass as object
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, "user");
      res.status(HTTP_STATUS.CREATED || 201).json({
        success: true,
        message: 'Email verified successfully! Your account has been created.',
        user: result.user,
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'OTP verification failed';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔍 [AuthController] Request body:`, req.body);
      const { email } = req.body;
      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }
      await this.authService.resendOtp({ email });
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'New OTP sent to your email',
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'Failed to resend OTP';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginUserDTO = req.body;
      const result = await this.authService.login(loginData);
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, "user");
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { credential } = req.body;
      if (!credential) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Missing Google credential',
        });
        return;
      }
      const result = await this.authService.googleLogin(credential);
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, "user");
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Google login successful',
        user: result.user,
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'Google authentication failed';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: 'Refresh token not found',
        });
        return;
      }
      const newAccessToken = await this.authService.refreshToken(refreshToken);
      updateAccessTokenCookie(res, newAccessToken, 'user');
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.UNAUTHORIZED;
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  sendResetLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`🔍 [AuthController] Request body:`, req.body);
      const { email } = req.body;
      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }
     await this.authService.sendResetLink({email});
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: SUCCESS_MESSAGES.OTP_SEND_SUCCESS || 'Reset link sent successfully',
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'Failed to send reset link';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password, confirmPassword } = req.body;
      if (!token || !password || !confirmPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Token, password, and confirm password are required',
        });
        return;
      }
      await this.authService.resetPassword({token, password, confirmPassword});
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS || 'Password reset successful',
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      const message = error instanceof Error ? error.message : 'Password reset failed';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      clearAuthCookies(res);
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error(`❌ [AuthController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Logout failed';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };
}