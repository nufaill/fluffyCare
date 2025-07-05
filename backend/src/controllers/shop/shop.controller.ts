// backend/src/controllers/shop/shop.controller.ts 
import { Request, Response } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { ShopRepository } from '../../repositories/shopRepository';
import { CustomError } from '../../util/CustomerError';
import { CreateShopData } from 'types/Shop.types';

export class ShopController {
  constructor(private shopRepository: ShopRepository) { }
  getAllShops = async (req: Request, res: Response): Promise<void> => {
    try {
      const shops = await this.shopRepository.getAllShops();
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: shops,
        message: 'shops fetched successfully'
      });
    } catch (error) {
      console.error("❌ [AdminShopController] Get all shops error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ?
        error.message :
        'Failed to fetch shops';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
  updateShopStatus = async (req: Request, res: Response): Promise<void> => {
    try {

      const { shopId } = req.params;
      const { isActive } = req.body;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
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

      const updatedShop = await this.shopRepository.updateShopStatus(shopId, isActive);

      if (!updatedShop) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: 'Shop not found'
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedShop,
        message: `Shop ${isActive ? 'activated' : 'blocked'} successfully`
      });
    } catch (error) {
      console.error("❌ [AdminShopController] Update shop status error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ?
        error.message :
        'Failed to update shop status';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  getUnverifiedShops = async (req: Request, res: Response): Promise<void> => {
    try {
      const unverifiedShops = await this.shopRepository.getUnverifiedShops();
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: unverifiedShops,
        message: 'Unverified shops fetched successfully'
      });
    } catch (error) {
      console.error("❌ [AdminShopController] Get unverified shops error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ?
        error.message :
        'Failed to fetch unverified shops';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Approve shop verification
  approveShop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      const approvedShop = await this.shopRepository.updateShopVerification(shopId, true);

      if (!approvedShop) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: 'Shop not found'
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: approvedShop,
        message: 'Shop approved successfully'
      });
    } catch (error) {
      console.error("❌ [AdminShopController] Approve shop error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ?
        error.message :
        'Failed to approve shop';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  // Reject shop (no status change, just for logging/tracking)
  rejectShop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;
      const { rejectionReason } = req.body;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      // Check if shop exists and is unverified
      const shop = await this.shopRepository.findById(shopId);

      if (!shop) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: 'Shop not found'
        });
        return;
      }

      if (shop.isVerified) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop is already verified'
        });
        return;
      }


      console.log(`🚫 [AdminShopController] Shop ${shopId} rejected. Reason: ${rejectionReason || 'No reason provided'}`);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Shop rejection processed successfully',
        data: {
          shopId,
          action: 'rejected',
          rejectionReason: rejectionReason || 'No reason provided'
        }
      });
    } catch (error) {
      console.error("❌ [AdminShopController] Reject shop error:", error);

      const statusCode = error instanceof CustomError ?
        error.statusCode :
        (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error ?
        error.message :
        'Failed to process shop rejection';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
  getShopProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;
      if (!shopId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND
        });
        return;
      }

      const shop = await this.shopRepository.findById(shopId);
      if (!shop) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        });
        return;
      }

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

  updateShopProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if(!req.shop){
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message :ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        })
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

      const { name, phone, logo, location } = req.body;

      // Validate input
      if (!name && !phone && !logo && !location) {
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

      const updateData: Partial<CreateShopData> = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (logo) updateData.logo = logo;
      if (location) updateData.location = location;

      const updatedShop = await this.shopRepository.updateShop(shopId, updateData);

      if (!updatedShop) {
        res.status(HTTP_STATUS.NOT_FOUND || 404).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        });
        return;
      }

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          id: updatedShop.id.toString(),
          logo: updatedShop.logo,
          name: updatedShop.name,
          email: updatedShop.email,
          phone: updatedShop.phone,
          city: updatedShop.city,
          streetAddress: updatedShop.streetAddress,
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