// backend/src/controllers/user/user.controller.ts 
import { Request, Response } from 'express';
import { AuthService } from '../../services/user/authService';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { UserRepository } from '../../repositories/userRepository';
import { CustomError } from '../../util/CustomerError';
import { NextFunction } from 'express-serve-static-core';

export class UserController {
   constructor(private userRepository: UserRepository) {}
    getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {

      const users = await this.userRepository.getAllUsers();

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: users,
        message: 'Users fetched successfully'
      });
    } catch (error) {
      console.error("❌ [AdminUserController] Get all users error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ? 
        error.message : 
        'Failed to fetch users';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
   updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (!userId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      if (typeof isActive !== 'boolean') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
        return;
      }

      const updatedUser = await this.userRepository.updateUserStatus(userId, isActive);

      if (!updatedUser) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedUser,
        message: `User ${isActive ? 'activated' : 'blocked'} successfully`
      });
    } catch (error) {
      console.error("❌ [AdminUserController] Update user status error:", error);

      const statusCode = error instanceof CustomError ? 
        error.statusCode : 
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ? 
        error.message : 
        'Failed to update user status';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
}