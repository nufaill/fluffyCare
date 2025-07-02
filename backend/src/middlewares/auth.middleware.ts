// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt/jwtService';
import { HTTP_STATUS } from '../shared/constant';
import { CustomError } from '../util/CustomerError';

export interface AuthenticatedRequest extends Request {
  shop?: {
    id: string;
    email: string;
  };
}

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  public authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Access token is required',
        });
        return;
      }

      const token = authHeader.substring(7); 

      const payload = this.jwtService.verifyAccessToken(token);
      
      if (!payload || typeof payload === 'string') {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired access token',
        });
        return;
      }

      req.shop = {
        id: payload.id,
        email: payload.email,
      };

      next();
    } catch (error) {
      console.error('❌ [AuthMiddleware] Authentication error:', error);
      
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  };
}