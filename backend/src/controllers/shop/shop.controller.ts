// backend/src/controllers/shop/shop.controller.ts 
import { Request, Response } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { ShopService } from "../../services/shop/shop.service";
import { CustomError } from '../../util/CustomerError';
import { CreateShopData } from 'types/Shop.types';

export class ShopController {
  constructor(private shopService: ShopService) { }
  
  getAllShops = async (req: Request, res: Response): Promise<void> => {
    try {
      const shops = await this.shopService.getAllShops();
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

      const updatedShop = await this.shopService.updateShopStatus(shopId, isActive);

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
      const unverifiedShops = await this.shopService.getUnverifiedShops();
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

      const approvedShop = await this.shopService.approveShop(shopId);

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

      const shop = await this.shopService.rejectShop(shopId);

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
      // Check if shop is authenticated
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

      const { name, phone, logo, location, city, streetAddress, description } = req.body;

      const updateData: Partial<CreateShopData> = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (logo) updateData.logo = logo;
      if (location) updateData.location = location;
      if (city) updateData.city = city;
      if (streetAddress) updateData.streetAddress = streetAddress;
      if (description) updateData.description = description;

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