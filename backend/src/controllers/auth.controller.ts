import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterSchema, LoginSchema } from '../validations';
import { UserRepository } from '../repositories/userRepository';
import { JwtService } from '../services/jwt/jwtService';
import {
  setAuthCookies,
  clearAuthCookies,
  updateCookieWithAccessToken
} from '../util/cookie-helper';

const authService = new AuthService(new UserRepository(), new JwtService());

const ACCESS_TOKEN_NAME = 'accessToken';
const REFRESH_TOKEN_NAME = 'refreshToken';

export const authController = {
  register: async (req: Request<{}, {}, RegisterSchema>, res: Response) => {
    try {
      const result = await authService.register({ ...req.body });

      setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
        ACCESS_TOKEN_NAME,
        REFRESH_TOKEN_NAME
      );

      res.status(201).json({ success: true, user: result.user });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  },

  login: async (req: Request<{}, {}, LoginSchema>, res: Response) => {
    try {
      const result = await authService.login(req.body);

      setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
        ACCESS_TOKEN_NAME,
        REFRESH_TOKEN_NAME
      );

      res.status(200).json({ success: true, user: result.user });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  },

  logout: async (req: Request, res: Response) => {
    clearAuthCookies(res, ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_NAME];
      if (!refreshToken) throw new Error("Refresh token missing");

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      updateCookieWithAccessToken(res, newAccessToken, ACCESS_TOKEN_NAME);

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(401).json({ success: false, message: (err as Error).message });
    }
  },

  me: async (req: Request, res: Response) => {
    res.json({ success: true, userId: req.user?.id });
  }
};
