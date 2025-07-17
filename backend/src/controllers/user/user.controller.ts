import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../../interfaces/controllerInterfaces/IUserController';
import { UserService } from '../../services/user/user.service';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { UpdateUserStatusDTO, UpdateUserDTO } from '../../dto/user.dto';

export class UserController implements IUserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: users,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCESS || 'Users fetched successfully',
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.USERS_FETCHED_FAILED || 'Failed to fetch users';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const updateStatusDTO: UpdateUserStatusDTO = req.body;

      const updatedUser = await this.userService.updateUserStatus(userId, updateStatusDTO.isActive);
      
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedUser,
        message: `User ${updateStatusDTO.isActive ? 'activated' : 'blocked'} successfully`,
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to update user status';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await this.userService.getProfile(userId);
      
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          profileImage: user.profileImage,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isActive: user.isActive,
        },
        message: SUCCESS_MESSAGES.PROFILE_FETCHED_SUCCESS || 'Profile fetched successfully',
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.PROFILE_FETCHED_FAILED || 'Failed to fetch profile';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const updateUserDTO: UpdateUserDTO = req.body;

    const updatedUser = await this.userService.updateUser(userId, updateUserDTO);
    
    res.status(HTTP_STATUS.OK || 200).json({
      success: true,
      data: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        fullName: updatedUser!.fullName,
        phone: updatedUser!.phone,
        profileImage: updatedUser!.profileImage,
        location: updatedUser!.location,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
        isActive: updatedUser!.isActive,
      },
      message: SUCCESS_MESSAGES.PROFILE_UPDATED_SUCCESS || 'Profile updated successfully',
    });
  } catch (error) {
    console.error(`❌ [UserController] Error:`, error);
    const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.PROFILE_UPDATE_FAILED || 'Failed to update profile';
    res.status(statusCode).json({
      success: false,
      message,
    });
    next(error);
  }
};
}