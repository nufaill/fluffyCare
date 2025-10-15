import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { IShopService } from '../../interfaces/serviceInterfaces/IShopService';
import { IShopAvailabilityService } from '../../interfaces/serviceInterfaces/IShopAvailabilityService';
import { IWalletService } from '../../interfaces/serviceInterfaces/IWalletService';
import { CustomError } from '../../util/CustomerError';
import { CreateShopData } from 'types/Shop.types';
import { UpdateShopStatusDTO, UpdateShopDTO, RejectShopDTO, ShopResponseDTO, ShopAvailabilityDTO } from '../../dto/shop.dto';
import { IWalletTransaction } from '../../types/Wallet.types';
import { IShopController } from '../../interfaces/controllerInterfaces/IShopController';
import { Types } from 'mongoose';
import Stripe from "stripe";
import mongoose from 'mongoose';

export class ShopController implements IShopController {
  private stripe: Stripe;

  constructor(
    private _shopService: IShopService,
    private _shopAvailabilityService: IShopAvailabilityService,
    private _walletService: IWalletService
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-06-30.basil",
    });
  }

  getAllShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Page and limit must be positive integers'
        });
        return;
      }

      const { shops, total, page: currentPage, limit: currentLimit } = await this._shopService.getAllShops(page, limit);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: shops,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit)
        },
        message: 'Shops fetched successfully'
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

      const updatedShop = await this._shopService.updateShopStatus(shopId, body.isActive);

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

  getShopSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.params;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      const subscriptionInfo = await this._shopService.getShopSubscription(shopId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: subscriptionInfo,
        message: 'Shop subscription fetched successfully'
      });
    } catch (error) {
      console.error("⚠️ [ShopController] Get shop subscription error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch shop subscription';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };


  createSubscriptionPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { amount, currency, shopId, planName } = req.body;

      const requiredFields = [
        { field: 'amount', value: amount },
        { field: 'currency', value: currency },
        { field: 'shopId', value: shopId },
        { field: 'planName', value: planName },
      ];

      const missingField = requiredFields.find(({ value }) =>
        value === undefined || value === null || value === ""
      );

      if (missingField) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Missing required field: ${missingField.field}`,
        });
        return;
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          shopId,
          planName,
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("⚠️ [ShopController] Create subscription payment intent error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to create payment intent: ${error.message}`,
      });
    }
  };

  confirmSubscriptionPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentIntentId, shopId, planName, subscriptionId, subscriptionStart, subscriptionEnd, amount, currency } = req.body;

      if (!paymentIntentId || !shopId || !planName || !amount || !currency) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Missing required fields',
        });
        return;
      }

      if (!Types.ObjectId.isValid(shopId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid shopId',
        });
        return;
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Payment not successful',
        });
        return;
      }

      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        const updatedShop = await this._shopService.updateShopSubscription(shopId, {
          subscriptionId: subscriptionId,
          plan: planName,
          subscriptionStart: subscriptionStart ? new Date(subscriptionStart) : new Date(),
          subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : undefined,
          isActive: true
        });

        const adminId = process.env.ADMIN_ID || '685ff3212adf35c013419da4';
        const adminWallet = await this._walletService.getWalletByOwner(new Types.ObjectId(adminId), 'admin', session);
        if (!adminWallet) {
          throw new CustomError('Admin wallet not found', HTTP_STATUS.NOT_FOUND);
        }

        const adminTransaction: IWalletTransaction = {
          type: 'credit',
          amount: amount / 100,
          currency,
          description: `Subscription payment received from shop ${shopId} for plan ${planName}`,
          referenceId: undefined,
        };

        await this._walletService.walletRepository.updateBalance(
          new Types.ObjectId(adminWallet._id),
          adminTransaction.amount,
          'credit'
        );
        await this._walletService.walletRepository.addTransaction(
          new Types.ObjectId(adminWallet._id),
          adminTransaction
        );
      });

      session.endSession();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Subscription payment confirmed and updated successfully',
      });
    } catch (error: any) {
      console.error("⚠️ [ShopController] Confirm subscription payment error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to confirm subscription payment: ${error.message}`,
      });
    }
  };
  updateShopSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { shopId } = req.params;
      const { planName, subscriptionId, subscriptionStart, subscriptionEnd } = req.body;

      if (!shopId) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Shop ID is required'
        });
        return;
      }

      if (!planName) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Plan name is required'
        });
        return;
      }

      const updatedShop = await this._shopService.updateShopSubscription(shopId, {
        subscriptionId,
        plan: planName,
        subscriptionStart: subscriptionStart ? new Date(subscriptionStart) : undefined,
        subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : undefined,
      })

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedShop,
        message: `Shop subscription updated to  successfully`
      });
    } catch (error) {
      console.error("❌ [ShopController] Update shop subscription error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to update shop subscription';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  getUnverifiedShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'Page and limit must be positive integers'
        });
        return;
      }

      const { shops, total, page: currentPage, limit: currentLimit } = await this._shopService.getUnverifiedShops(page, limit);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: shops,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit)
        },
        message: 'Pending shops fetched successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Get pending shops error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch pending shops';

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

      const approvedShop = await this._shopService.approveShop(shopId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: approvedShop,
        message: 'Shop approved successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Approve shop error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 400);

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

      if (body.rejectionReason !== undefined) {
        if (typeof body.rejectionReason !== 'string') {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: 'rejectionReason must be a string'
          });
          return;
        }

        if (body.rejectionReason.trim().length === 0) {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: 'rejectionReason cannot be empty'
          });
          return;
        }

        if (body.rejectionReason.trim().length < 5) {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: 'rejectionReason must be at least 5 characters long'
          });
          return;
        }

        if (body.rejectionReason.length > 500) {
          res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
            success: false,
            message: 'rejectionReason must be less than 500 characters'
          });
          return;
        }
      }

      const shop = await this._shopService.rejectShop(shopId, body.rejectionReason);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Shop rejected successfully',
        data: {
          shop,
          action: 'rejected',
          rejectionReason: body.rejectionReason || null
        }
      });
    } catch (error) {
      console.error("❌ [ShopController] Reject shop error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to reject shop';

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

      const shop = await this._shopService.getShopById(shopId);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: shop,
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
      const { shopId } = req.params;
      if (!shopId) {
        res.status(HTTP_STATUS.UNAUTHORIZED || 401).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND
        });
        return;
      }

      const body: UpdateShopDTO = req.body;

      const validFields = ['name', 'phone', 'logo', 'city', 'streetAddress', 'description', 'location', 'certificateUrl'];
      const invalidFields = Object.keys(body).filter(key => !validFields.includes(key));
      if (invalidFields.length > 0) {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: `Invalid fields provided: ${invalidFields.join(', ')}`
        });
        return;
      }

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
      if (body.certificateUrl && typeof body.certificateUrl !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST || 400).json({
          success: false,
          message: 'certificateUrl must be a string'
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
      if (body.description) updateData.description = body.description;
      if (body.certificateUrl) updateData.certificateUrl = body.certificateUrl;

      const updatedShop = await this._shopService.updateShopProfile(shopId, updateData);

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: updatedShop,
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

  public getShopAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;
      const availability = await this._shopAvailabilityService.getShopAvailability(shopId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: availability,
      });
    } catch (error) {
      console.error('❌ [ShopController] Get availability error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to get shop availability';
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  public updateShopAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shopId } = req.params;
      const availabilityData = req.body;
      const updatedShop = await this._shopAvailabilityService.updateShopAvailability(shopId, availabilityData);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updatedShop,
      });
    } catch (error) {
      console.error('❌ [ShopController] Update availability error:', error);
      const statusCode = error instanceof CustomError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to update shop availability';
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };

  getShopsOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const overview = await this._shopService.getShopsOverview();

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: overview,
        message: 'Shops overview fetched successfully'
      });
    } catch (error) {
      console.error("❌ [ShopController] Get shops overview error:", error);

      const statusCode = error instanceof CustomError
        ? error.statusCode
        : (HTTP_STATUS.INTERNAL_SERVER_ERROR || 500);

      const message = error instanceof Error
        ? error.message
        : 'Failed to fetch shops overview';

      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  };
}