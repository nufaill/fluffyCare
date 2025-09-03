import { Request, Response } from 'express';
import { SubscriptionService } from '../../services/subscription/subscription.service';
import { CreateSubscriptionDTO, UpdateSubscriptionDTO, SubscriptionResponseDTO } from '../../dto/subscription.dto';
import { HTTP_STATUS } from '../../shared/constant';
import { Types } from 'mongoose';
import { ISubscriptionController } from '../../interfaces/controllerInterfaces/ISubscriptionController';
import { SubscriptionModel } from '@models/subscription.model';

interface PaymentResponseData {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  message?: string;
}

export class SubscriptionController implements ISubscriptionController {
  private readonly _subscriptionService: SubscriptionService;

  constructor(
    subscriptionService: SubscriptionService,
  ) {
    this._subscriptionService = subscriptionService;

    this.createSubscription = this.createSubscription.bind(this);
    this.updateSubscription = this.updateSubscription.bind(this);
    this.getAllSubscriptions = this.getAllSubscriptions.bind(this);
    this.getAllActiveSubscriptions = this.getAllActiveSubscriptions.bind(this);
  }

  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionData = new CreateSubscriptionDTO(req.body);

      const requiredFields = [
        { field: 'plan', value: subscriptionData.plan },
        { field: 'price', value: subscriptionData.price },
        { field: 'profitPercentage', value: subscriptionData.profitPercentage },
        { field: 'durationInDays', value: subscriptionData.durationInDays },
        { field: 'description', value: subscriptionData.description },
      ];

      const missingField = requiredFields.find(
        ({ value }) => value === undefined || value === null || value === ''
      );

      if (missingField) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Missing required field: ${missingField.field}`,
          data: null,
        });
        return;
      }

      const result = await this._subscriptionService.createSubscription(subscriptionData);
      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json({
          success: true,
          message: result.message || 'Subscription created successfully',
          data: result.data,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.message,
          data: null,
        });
      }


    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to create subscription: ${error.message}`,
        data: null,
      });
    }
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = new UpdateSubscriptionDTO(req.body);



      if (!id || !Types.ObjectId.isValid(id)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid subscription ID',
          data: null,
        });
        return;
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No update data provided',
          data: null,
        });
        return;
      }

      const result = await this._subscriptionService.updateSubscription(id, updateData);

      res.status(HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data || null,
      });
    } catch (error: any) {
      console.error('Update subscription error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to update subscription: ${error.message}`,
        data: null,
      });
    }
  }

  async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { plan, page, limit } = req.query;

      const query = {
        plan: plan as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this._subscriptionService.getAllSubscriptions(query);

      res.status(HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
      });
    } catch (error: any) {
      console.error('Get all subscriptions error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to retrieve subscriptions: ${error.message}`,
        data: null,
      });
    }
  }


  async getAllActiveSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = req.query;

      const query = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this._subscriptionService.getAllActiveSubscriptions(query);

      res.status(HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
      });
    } catch (error: any) {
      console.error('Get all active subscriptions error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to retrieve active subscriptions: ${error.message}`,
        data: null,
      });
    }
  }
  
  getSubscriptionByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planName } = req.params;
      const subscription = await SubscriptionModel.findOne({
        plan: planName,
        isActive: true
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { subscription }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription'
      });
    }
  };

}