// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt/jwt.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';
import { CustomError } from '../util/CustomerError';
import { updateAccessTokenCookie } from '../util/cookie-helper';

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) { }

  public authenticate = (role: "user" | "shop" | "admin") => (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let accessToken = "";
      let refreshToken = "";

      if (role === "user") {
        accessToken = req.cookies.userAccessToken;
        refreshToken = req.cookies.userRefreshToken;
      } else if (role === "shop") {
        accessToken = req.cookies.shopAccessToken;
        refreshToken = req.cookies.shopRefreshToken;
      } else {
        accessToken = req.cookies.adminAccessToken;
        refreshToken = req.cookies.adminRefreshToken;
      }

      if (!accessToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        });
      }

      const decoded = this.jwtService.verifyAccessToken(accessToken);
      
      if (decoded && typeof decoded === 'object') {
        if (role !== decoded.role) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
          });
        }

        this.setUserData(req, decoded, role);
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
        email: refreshDecoded.email,
        role: role
      });

      // Update access token cookie
      updateAccessTokenCookie(res, newAccessToken, role);

      const newDecoded = this.jwtService.verifyAccessToken(newAccessToken);
      if (newDecoded && typeof newDecoded === 'object') {
        this.setUserData(req, newDecoded, role);
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

  private setUserData(req: Request, decoded: any, role: string) {
    switch (role) {
      case "user": {
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
        break;
      }
      case "shop": {
        req.shop = {
          shopId: decoded.shopId,
          email: decoded.email
        };
        break;
      }
      case "admin": {
        req.admin = {
          adminId: decoded.adminId,
          email: decoded.email
        };
        break;
      }
    }
  }

  public refreshToken = (role: "user" | "shop" | "admin") => (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let refreshToken = "";

      if (role === "user") {
        refreshToken = req.cookies.userRefreshToken;
      } else if (role === "shop") {
        refreshToken = req.cookies.shopRefreshToken;
      } else {
        refreshToken = req.cookies.adminRefreshToken;
      }

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
        email: decoded.email,
        role: role
      });

      updateAccessTokenCookie(res, newAccessToken, role);

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