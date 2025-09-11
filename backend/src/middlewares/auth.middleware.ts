import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt/jwt.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';
import { updateAccessTokenCookie } from '../util/cookie-helper';

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) { }

  public authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const accessToken = req.cookies?.accessToken;
      const refreshToken = req.cookies?.refreshToken;

      if (!accessToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        });
      }

      const decoded = this.jwtService.verifyAccessToken(accessToken);
      
      if (decoded && typeof decoded === 'object') {
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
        return next();
      }

      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Token Expired"
        });
      }

      // Verify refresh token
      const refreshDecoded = this.jwtService.verifyRefreshToken(refreshToken);
      
      if (!refreshDecoded || typeof refreshDecoded !== 'object') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Invalid token"
        });
      }

      // Generate new access token
      const newAccessToken = this.jwtService.generateAccessToken({
        id: refreshDecoded.userId,
        email: refreshDecoded.email
      });

      // Update access token cookie
      updateAccessTokenCookie(res, newAccessToken);

      const newDecoded = this.jwtService.verifyAccessToken(newAccessToken);
      if (newDecoded && typeof newDecoded === 'object') {
        req.user = {
          userId: newDecoded.userId,
          email: newDecoded.email
        };
        return next();
      }

      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
      });

    } catch (error) {
      console.error('❌ [AuthMiddleware] Authentication error:', error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  };

  public refreshToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Refresh token not found"
        });
      }

      const decoded = this.jwtService.verifyRefreshToken(refreshToken);
      
      if (!decoded || typeof decoded !== 'object') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Invalid refresh token"
        });
      }

      const newAccessToken = this.jwtService.generateAccessToken({
        id: decoded.userId,
        email: decoded.email
      });

      updateAccessTokenCookie(res, newAccessToken);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken
      });

    } catch (error) {
      console.error('❌ [AuthMiddleware] Token refresh error:', error);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token refresh failed',
      });
    }
  };
}