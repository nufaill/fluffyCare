import { Request, Response, NextFunction } from 'express';
import { shopDependencies } from '../di/shopInjection';
import { CustomError } from '../util/CustomerError';
import { HTTP_STATUS } from '../shared/constant';

export const checkVerifiedShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shopId = (req as any).user?.userId;

    if (!shopId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized - No shop ID found'
      });
    }

    const shop = await shopDependencies.shopRepository.findById(shopId);

    if (!shop) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.isVerified.status !== 'approved') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Shop is not approved'
      });
    }

    (req as any).shop = shop;

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    console.error('❌ [VerifyShopMiddleware] Error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error'
    });
  }
};