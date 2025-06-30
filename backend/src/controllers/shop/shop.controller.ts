// backend/src/controllers/shop/shop.controller.ts 
import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { ShopRepository } from '../../repositories/shopRepository';
import { CustomError } from '../../util/CustomerError';

export class ShopController {
   constructor(private shopRepository: ShopRepository) {}
    getAllShops = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔧 [AdminShopController] Fetching all shops");
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
}