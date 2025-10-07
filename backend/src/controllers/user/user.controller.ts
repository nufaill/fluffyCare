import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../../interfaces/controllerInterfaces/IUserController';
import { IUserService } from '../../interfaces/serviceInterfaces/IUserService';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constant';
import { CustomError } from '../../util/CustomerError';
import { UpdateUserStatusDTO, UpdateUserDTO, CustomerAnalytics } from '../../dto/user.dto';
import { INearbyShopsService, NearbyShopsQuery } from '../../interfaces/serviceInterfaces/INearbyShopsService';

export class UserController implements IUserController {
  constructor(
    private _userService: IUserService,
    private _nearbyService: INearbyShopsService
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
    try {
      const { limit, sortOrder, openNow } = req.query;

      const query: NearbyShopsQuery = {
        limit: parseInt(limit as string) || 50,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : 'asc',
        openNow: openNow === 'true',
      };

      // Validate optional parameters
      if (query.limit && query.limit < 1) {
        throw new CustomError('Limit must be a positive integer', HTTP_STATUS.BAD_REQUEST);
      }

      const shops = await this._nearbyService.getNearbyShops(query);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: shops,
        message: `Found ${shops.length} shops`,
        meta: {
          count: shops.length,
        },
      });
    } catch (error) {
      console.error(`❌ [UserController] Error fetching shops:`, error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to fetch shops';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
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