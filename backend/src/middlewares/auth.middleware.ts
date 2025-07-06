// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt/jwt.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';
import { CustomError } from '../util/CustomerError';

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) { }

  public authenticate = (role: "user" | "shop" | "admin") => (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      const { accessToken } = req.cookies;

      const user = this.jwtService.decodeAccessToken(accessToken);
      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        })
        return;
      }

      if (role !== user.role) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        })
        return;
      }

      switch (role) {
        case "user": {
          req.user = {
            userId: user.userId,
            email: user.email
          }
          break;
        }
        case "shop": {
          req.shop = {
            shopId: user.shopId,
            email: user.email
          }
          break;
        }
        case "admin": {
          req.admin = {
            adminId: user.adminId,
            email: user.email
          }
          break;
        }
      }



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