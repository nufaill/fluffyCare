import { Request, Response } from 'express';
import { AuthService } from '../../services/user/authService';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constant';
import { UserRepository } from '../../repositories/userRepository';
import { CustomError } from '../../util/CustomerError';
import { NextFunction } from 'express-serve-static-core';
import { CreateUserData } from 'types/User.types';

export class UserController {
  constructor(private userRepository: UserRepository) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.getAllUsers();

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: users,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCESS,
      });
    } catch (error) {
      console.error("❌ [UserController] Get all users error:", error);

      const statusCode = error instanceof CustomError 
        ? error.statusCode 
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error 
        ? error.message 
        : ERROR_MESSAGES.USERS_FETCHED_FAILED;

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
          message: ERROR_MESSAGES.ID_REQUIRED
        });
        return;
      }

      if (typeof isActive !== 'boolean') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: ERROR_MESSAGES.IS_ACTIVE_ERROR
        });
        return;
      }

      const updatedUser = await this.userRepository.updateUserStatus(userId, isActive);

      if (!updatedUser) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedUser,
        message: `User ${isActive ? 'activated' : 'blocked'} successfully`
      });
    } catch (error) {
      console.error("❌ [UserController] Update user status error:", error);

      const statusCode = error instanceof CustomError 
        ? error.statusCode 
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error 
        ? error.message 
        : 'Failed to update user status';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND
        });
        return;
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          profileImage: user.profileImage,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isActive: user.isActive
        },
        message: SUCCESS_MESSAGES.PROFILE_FETCHED_SUCCESS || 'Profile fetched successfully'
      });
    } catch (error) {
      console.error("❌ [UserController] Get profile error:", error);

      const statusCode = error instanceof CustomError 
        ? error.statusCode 
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error 
        ? error.message 
        : ERROR_MESSAGES.PROFILE_FETCHED_FAILED || 'Failed to fetch profile';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND
        });
        return;
      }

      const { fullName, phone, profileImage, location } = req.body;

      // Validate input
      if (!fullName && !phone && !profileImage && !location) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_INPUT || 'At least one field must be provided for update'
        });
        return;
      }

      // Validate location if provided
      if (location) {
        if (!location.type || location.type !== 'Point' || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_LOCATION || 'Location must be a valid GeoJSON Point'
          });
          return;
        }
        const [lng, lat] = location.coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number' || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_LOCATION || 'Invalid longitude or latitude values'
          });
          return;
        }
      }

      const updateData: Partial<CreateUserData> = {};
      if (fullName) updateData.fullName = fullName;
      if (phone) updateData.phone = phone;
      if (profileImage) updateData.profileImage = profileImage;
      if (location) updateData.location = location;

      const updatedUser = await this.userRepository.updateUser(userId, updateData);

      if (!updatedUser) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: updatedUser._id.toString(),
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.phone,
          profileImage: updatedUser.profileImage,
          location: updatedUser.location,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          isActive: updatedUser.isActive
        },
        message: SUCCESS_MESSAGES.PROFILE_UPDATED_SUCCESS || 'Profile updated successfully'
      });
    } catch (error) {
      console.error("❌ [UserController] Update profile error:", error);

      const statusCode = error instanceof CustomError 
        ? error.statusCode 
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error 
        ? error.message 
        : ERROR_MESSAGES.PROFILE_UPDATE_FAILED || 'Failed to update profile';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
}