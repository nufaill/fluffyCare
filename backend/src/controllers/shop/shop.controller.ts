// backend/src/controllers/shop/shop.controller.ts 
import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { ShopRepository } from '../../repositories/shopRepository';
import { CustomError } from '../../util/CustomerError';

export class ShopController {
   constructor(private shopRepository: ShopRepository) {}
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
}