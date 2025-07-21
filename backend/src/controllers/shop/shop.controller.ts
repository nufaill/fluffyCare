import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { ShopService } from "../../services/shop/shop.service";
import { CustomError } from '../../util/CustomerError';
import { CreateShopData } from 'types/Shop.types';
import { UpdateShopStatusDTO, UpdateShopDTO, RejectShopDTO } from '../../dto/shop.dto';
import { IShopController } from '../../interfaces/controllerInterfaces/IShopController';

export class ShopController implements IShopController {
  constructor(private shopService: ShopService) { }

  getAllShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shops = await this.shopService.getAllShops();
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: shops,
        message: 'shops fetched successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Get all shops error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch shops';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  updateShopStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.params;
      const body: UpdateShopStatusDTO = req.body;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      if (typeof body.isActive !== 'boolean') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
        return;
      }

      const updatedShop = await this.shopService.updateShopStatus(shopId, body.isActive);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedShop,
        message: `Shop ${body.isActive ? 'activated' : 'blocked'} successfully`
      });
    } catch (error) {
      console.error("❌ [ShopController] Update shop status error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to update shop status';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  getUnverifiedShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unverifiedShops = await this.shopService.getUnverifiedShops();
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: unverifiedShops,
        message: 'Unverified shops fetched successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Get unverified shops error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch unverified shops';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  approveShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.params;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      const approvedShop = await this.shopService.approveShop(shopId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: approvedShop,
        message: 'Shop approved successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Approve shop error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to approve shop';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  rejectShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.params;
      const body: RejectShopDTO = req.body;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      if (body.rejectionReason && typeof body.rejectionReason !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'rejectionReason must be a string'
        });
        return;
      }

      const shop = await this.shopService.rejectShop(shopId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Shop rejection processed successfully',
        data: {
          shopId,
          action: 'rejected',
          rejectionReason: body.rejectionReason || 'No reason provided'
        }
      });
    } catch (error) {
      console.error("❌ [ShopController] Reject shop error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to process shop rejection';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  getShopProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.params;
      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      const shop = await this.shopService.getShopById(shopId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: shop._id.toString(),
          logo: shop.logo,
          name: shop.name,
          email: shop.email,
          phone: shop.phone,
          city: shop.city,
          streetAddress: shop.streetAddress,
          staffCount:shop.staffCount,
          description: shop.description,
          certificateUrl: shop.certificateUrl,
          location: shop.location,
          isActive: shop.isActive,
          isVerified: shop.isVerified
        },
        message: SUCCESS_MESSAGES.PROFILE_FETCHED_SUCCESS || 'Profile fetched successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Get profile error:", error);

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

  updateShopProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.shop) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        });
        return;
      }

      const { shopId } = req.shop;
      if (!shopId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND
        });
        return;
      }

      const body: UpdateShopDTO = req.body;

      // Manual validation for UpdateShopDTO
      const validFields = ['name', 'phone', 'logo', 'city', 'streetAddress', 'description', 'location','staffCount'];
      const invalidFields = Object.keys(body).filter(key => !validFields.includes(key));
      if (invalidFields.length > 0) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: `Invalid fields provided: ${invalidFields.join(', ')}`
        });
        return;
      }

      // Validate types for provided fields
      if (body.name && typeof body.name !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'name must be a string'
        });
        return;
      }
      if (body.phone && typeof body.phone !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'phone must be a string'
        });
        return;
      }
      if (body.logo && typeof body.logo !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'logo must be a string'
        });
        return;
      }
      if (body.city && typeof body.city !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'city must be a string'
        });
        return;
      }
      if (body.streetAddress && typeof body.streetAddress !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'streetAddress must be a string'
        });
        return;
      }
      if (body.description && typeof body.description !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'description must be a string'
        });
        return;
      }
      if (body.location) {
        if (body.location.type !== 'Point' || !Array.isArray(body.location.coordinates) || body.location.coordinates.length !== 2 || !body.location.coordinates.every((coord: any) => typeof coord === 'number')) {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: 'location must be a valid Point object with [number, number] coordinates'
          });
          return;
        }
      }

      const updateData: Partial<CreateShopData> = {};
      if (body.name) updateData.name = body.name;
      if (body.phone) updateData.phone = body.phone;
      if (body.logo) updateData.logo = body.logo;
      if (body.location) updateData.location = body.location;
      if (body.city) updateData.city = body.city;
      if (body.streetAddress) updateData.streetAddress = body.streetAddress;
      if (body.staffCount) updateData.staffCount = body.staffCount;
      if (body.description) updateData.description = body.description;

      const updatedShop = await this.shopService.updateShopProfile(shopId, updateData);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: updatedShop._id.toString(),
          logo: updatedShop.logo,
          name: updatedShop.name,
          email: updatedShop.email,
          phone: updatedShop.phone,
          city: updatedShop.city,
          streetAddress: updatedShop.streetAddress,
          staffCount:updatedShop.staffCount,
          description: updatedShop.description,
          certificateUrl: updatedShop.certificateUrl,
          location: updatedShop.location,
          isActive: updatedShop.isActive,
          isVerified: updatedShop.isVerified
        },
        message: SUCCESS_MESSAGES.PROFILE_UPDATED_SUCCESS || 'Profile updated successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Update profile error:", error);

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