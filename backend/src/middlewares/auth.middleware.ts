// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt/jwtService';
import { UserPayload } from '../types/auth.types';
import { JwtPayload } from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}

export class AuthMiddleware {
  constructor(private jwtService: JwtService) { }

  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Try to get token from cookies first, then from Authorization header
      let token = req.cookies?.accessToken;

      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
        });
        return;
      }

      const payload = this.jwtService.verifyAccessToken(token);

      if (!payload || typeof payload === 'string') {
        res.status(401).json({
          success: false,
          message: 'Access token required',
        });

      }

      req.user = payload as UserPayload;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  };

  optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      let token = req.cookies?.accessToken;

      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (token) {
        const payload = this.jwtService.verifyAccessToken(token);
        if (payload) {
          req.user = payload as UserPayload;
        }
      }

      next();
    } catch (error) {
      // Continue without authentication for optional auth
      next();
    }
  };
}