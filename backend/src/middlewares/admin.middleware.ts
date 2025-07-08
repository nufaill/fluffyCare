// backend/src/middlewares/admin.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt/jwt.service';
import { HTTP_STATUS } from '../shared/constant';

export class AdminMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authorization header is required',
        });
        return;
      }

      if (!authHeader.startsWith('Bearer ')) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid authorization header format. Use: Bearer <token>',
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

      // Handle both userId and id fields for compatibility
      const adminId = payload.userId || payload.id;
      if (!adminId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token payload structure',
        });
        return;
      }

      req.admin = {
        adminId: adminId,
        email: payload.email,
      };
      next();
    } catch (error:any) {
      console.error('❌ [AdminMiddleware] Authentication error:', error);
      
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}