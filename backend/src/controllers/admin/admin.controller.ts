import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/admin/admin.service';
import { CreateAdminDto, LoginDto, AuthResponseDto } from '../../dtos/admin.dto';
import { setAuthCookies, clearAuthCookies } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';

export class AdminAuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result: AuthResponseDto = await this.authService.login(loginDto);

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

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createAdminDto: CreateAdminDto = req.body;
      const admin = await this.authService.createAdmin(createAdminDto);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.ADMIN_CREATED,
        admin,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const updateAdminDto: Partial<CreateAdminDto> = req.body;
      const admin = await this.authService.updateAdmin(id, updateAdminDto);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ADMIN_UPDATED,
        admin,
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