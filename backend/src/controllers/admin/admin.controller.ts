import { Request, Response, NextFunction } from 'express';
import { IAdminController } from '../../interfaces/controllerInterfaces/IAdminController';
import { IAdminService } from '../../interfaces/serviceInterfaces/IAdminService';
import { LoginDto, AuthResponseDto } from '../../dto/admin.dto';
import { setAuthCookies, clearAuthCookies } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';

export class AdminAuthController implements IAdminController {
  constructor(private _adminService: IAdminService) {} 

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result: AuthResponseDto = await this._adminService.login(loginDto); 

      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken, 'admin');

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        admin: result.admin,
        token: result.tokens.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      clearAuthCookies(res);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}