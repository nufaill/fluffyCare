// backend/src/controllers/admin/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/admin/admin.service';
import { setAuthCookies, clearAuthCookies } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';

export class AdminAuthController {
  constructor(private authService: AuthService) {}

  // Admin Login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({ email, password });

      // Set cookies for tokens
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken,'admin');

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        admin: result.admin,
        token: result.tokens.accessToken
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin Logout
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      clearAuthCookies(res);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      });
    } catch (error) {
      console.error("❌ [AdminController] Logout error:", error);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Logout failed",
      });
    }
  };
}