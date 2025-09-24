import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../../interfaces/controllerInterfaces/IUserController';
import { IUserService } from '../../interfaces/serviceInterfaces/IUserService';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { UpdateUserStatusDTO, UpdateUserDTO, CustomerAnalytics } from '../../dto/user.dto';
import { NearbyService } from '../../services/user/nearby.service';

export class UserController implements IUserController {
  constructor(
    private _userService: IUserService,
    private _nearbyService: NearbyService
  ) { }

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        throw new CustomError('Page and limit must be positive integers', HTTP_STATUS.BAD_REQUEST);
      }

      const { users, total, totalPages } = await this._userService.getAllUsers(page, limit);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: users,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCESS,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.USERS_FETCHED_FAILED;
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
      if (!userId) {
        throw new CustomError('User ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      const updateStatusDTO: UpdateUserStatusDTO = req.body;

      const updatedUser = await this._userService.updateUserStatus(userId, updateStatusDTO.isActive);

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
      const user = await this._userService.getProfile(userId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: user,
        message: SUCCESS_MESSAGES.PROFILE_FETCHED_SUCCESS,
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.PROFILE_FETCHED_FAILED;
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

      const updatedUser = await this._userService.updateUser(userId, updateUserDTO);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedUser,
        message: SUCCESS_MESSAGES.PROFILE_UPDATED_SUCCESS,
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.PROFILE_UPDATE_FAILED;
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };

  getNearbyShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // try {
    //   const { lat, lng, radius } = req.query;

    //   // Validate required parameters
    //   if (!lat || !lng) {
    //     return res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
    //       success: false,
    //       message: 'Latitude and longitude are required',
    //     });
    //   }

    //   const nearbyShopsQuery = {
    //     latitude: parseFloat(lat as string),
    //     longitude: parseFloat(lng as string),
    //     maxDistance: radius ? parseInt(radius as string) : 5000,
    //   };

    //   // Validate coordinates
    //   if (
    //     isNaN(nearbyShopsQuery.latitude) ||
    //     isNaN(nearbyShopsQuery.longitude) ||
    //     nearbyShopsQuery.latitude < -90 || nearbyShopsQuery.latitude > 90 ||
    //     nearbyShopsQuery.longitude < -180 || nearbyShopsQuery.longitude > 180
    //   ) {
    //     return res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
    //       success: false,
    //       message: 'Invalid latitude or longitude values',
    //     });
    //   }

    //   const nearbyShops = await this.nearbyService.findNearbyShops(nearbyShopsQuery);

    //   res.status(HTTP_STATUS.OK || 200).json({
    //     success: true,
    //     data: nearbyShops,
    //     message: `Found ${nearbyShops.length} nearby shops`,
    //     meta: {
    //       count: nearbyShops.length,
    //       searchRadius: nearbyShopsQuery.maxDistance,
    //       userLocation: {
    //         latitude: nearbyShopsQuery.latitude,
    //         longitude: nearbyShopsQuery.longitude,
    //       },
    //     },
    //   });
    // } catch (error) {
    //   console.error(`❌ [UserController] Error fetching nearby shops:`, error);
    //   const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    //   const message = error instanceof Error ? error.message : 'Failed to fetch nearby shops';
    //   res.status(statusCode).json({
    //     success: false,
    //     message,
    //   });
    //   next(error);
    // }
  };

  getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics: CustomerAnalytics = await this._userService.getCustomerAnalytics();

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: analytics,
        message: SUCCESS_MESSAGES.USERS_FETCHED_SUCESS,
      });
    } catch (error) {
      console.error(`❌ [UserController] Error:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to fetch customer analytics';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  };
}