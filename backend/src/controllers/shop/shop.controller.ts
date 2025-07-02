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
}