// backend/src/controllers/user/auth.controller.ts 
import { Request, Response } from 'express';
import { AuthService } from '../../services/user/auth.service';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { NextFunction } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class AuthController {
  constructor(private authService: AuthService) { }
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [AuthController] Registration request received");

      const result = await this.authService.register(req.body);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
        email: result.email,
        otpSent: true,
      });
    } catch (error) {
      console.error("❌ [AuthController] Registration initiation error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'Failed to send verification email';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [AuthController] OTP verification request received");

      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Email and OTP are required',
        });
        return;
      }

      const result = await this.authService.verifyOtpAndCompleteRegistration(email, otp);

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(HTTP_STATUS.CREATED || 201).json({
        success: true,
        message: 'Email verified successfully! Your account has been created.',
        user: result.user,
      });
    } catch (error) {
      console.error("❌ [AuthController] OTP verification error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'OTP verification failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [AuthController] Resend OTP request received");

      const { email } = req.body;

      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this.authService.resendOtp(email);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'New OTP sent to your email',
      });
    } catch (error) {
      console.error("❌ [AuthController] Resend OTP error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'Failed to resend OTP';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [AuthController] Login request received");

      const result = await this.authService.login(req.body);

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
      });
    } catch (error) {
      console.error("❌ [AuthController] Login error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'Login failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { credential } = req.body;

      if (!credential) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: "Missing Google credential",
        });
        return;
      }

      console.log("🔧 [AuthController] Processing Google authentication...");

      const result = await this.authService.googleLogin(credential);

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: "Google login successful",
        user: result.user,
      });
    } catch (error) {
      console.error("❌ [AuthController] Google auth error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'Google authentication failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: 'Refresh token not found',
        });
        return;
      }

      console.log("🔧 [AuthController] Refreshing token...");
      const newAccessToken = await this.authService.refreshToken(refreshToken);

      updateAccessTokenCookie(res, newAccessToken);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      console.error("❌ [AuthController] Token refresh error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.UNAUTHORIZED || 401);

      const message = error instanceof Error ?
        error.message :
        'Token refresh failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
   sendResetLink=async(req: Request, res: Response, next: NextFunction) =>{
    try {
      console.log("🔧 [AuthController] Send reset link request received");

      const { email } = req.body;

      if (!email) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this.authService.sendResetLink(email);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: SUCCESS_MESSAGES.OTP_SEND_SUCCESS || 'Reset link sent successfully'
      });
    } catch (error) {
      console.error("❌ [AuthController] Send reset link error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'Failed to send reset link';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }

 
  resetPassword = async(req: Request, res: Response, next: NextFunction) =>{
    try {
      console.log("🔧 [AuthController] Reset password request received");

      const { token, password, confirmPassword } = req.body;

      if (!token || !password || !confirmPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Token, password, and confirm password are required',
        });
        return;
      }

      await this.authService.resetPassword(token, password, confirmPassword);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS || 'Password reset successful'
      });
    } catch (error) {
      console.error("❌ [AuthController] Reset password error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.BAD_REQUEST || 400);

      const message = error instanceof Error ?
        error.message :
        'Password reset failed';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [AuthController] Logout request received");

      clearAuthCookies(res);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error("❌ [AuthController] Logout error:", error);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  };
}