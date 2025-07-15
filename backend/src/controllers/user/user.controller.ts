// user.controller.ts
import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/user.repository';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { CreateUserData, User } from '../../types/User.types';

// Centralized error handler
const handleError = (error: unknown, res: Response, defaultMessage: string, defaultStatus: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  console.error(`❌ [UserController] Error:`, error);
  const statusCode = error instanceof CustomError ? error.statusCode : defaultStatus;
  const message = error instanceof Error ? error.message : defaultMessage;
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export class UserController {
  constructor(private userRepository: UserRepository) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.getAllUsers();
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: users,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCESS || 'Users fetched successfully',
      });
    } catch (error) {
      handleError(error, res, ERROR_MESSAGES.USERS_FETCHED_FAILED || 'Failed to fetch users');
    }
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      if (!userId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: ERROR_MESSAGES.ID_REQUIRED || 'User ID is required',
        });
        return;
      }
      if (typeof isActive !== 'boolean') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: ERROR_MESSAGES.IS_ACTIVE_ERROR || 'isActive must be a boolean',
        });
        return;
      }
      const updatedUser = await this.userRepository.updateUserStatus(userId, isActive);
      if (!updatedUser) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND || 'User not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedUser,
        message: `User ${isActive ? 'activated' : 'blocked'} successfully`,
      });
    } catch (error) {
      handleError(error, res, 'Failed to update user status');
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND || 'User ID required',
        });
        return;
      }
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND || 'User not found',
        });
        return;
      }
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
      handleError(error, res, ERROR_MESSAGES.PROFILE_FETCHED_FAILED || 'Failed to fetch profile');
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND || 'User ID required',
        });
        return;
      }
      const { fullName, phone, profileImage, location } = req.body;
      if (!fullName && !phone && !profileImage && !location) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_INPUT || 'At least one field must be provided for update',
        });
        return;
      }
      const updateData: Partial<CreateUserData> = { fullName, phone, profileImage, location };
      const updatedUser = await this.userRepository.updateUser(userId, updateData);
      if (!updatedUser) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND || 'User not found',
        });
        return;
      }
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: updatedUser._id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
          location: updatedUser.location,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          isActive: updatedUser.isActive,
        },
        message: SUCCESS_MESSAGES.PROFILE_UPDATED_SUCCESS || 'Profile updated successfully',
      });
    } catch (error) {
      handleError(error, res, ERROR_MESSAGES.PROFILE_UPDATE_FAILED || 'Failed to update profile');
    }
  };
}