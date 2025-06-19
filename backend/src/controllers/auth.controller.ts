// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../util/cookie-helper';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      
      res.status(201).json({
        success: true,
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      
      res.status(200).json({
        success: true,
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        res.status(400).json({
          success: false,
          message: 'Google ID token is required',
        });
        return;
      }

      const result = await this.authService.googleAuth(idToken);
      
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      
      res.status(200).json({
        success: true,
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google authentication failed';
      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not found',
        });
        return;
      }

      const newAccessToken = await this.authService.refreshToken(refreshToken);
      
      updateAccessTokenCookie(res, newAccessToken);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json({
        success: false,
        message,
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    clearAuthCookies(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  };

  me = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  };
}