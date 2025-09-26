import { Request, Response } from 'express';
import { ISubscriptionService } from '../../interfaces/serviceInterfaces/ISubscriptionService';
import { CreateSubscriptionDTO, UpdateSubscriptionDTO } from '../../dto/subscription.dto';
import { HTTP_STATUS } from '../../shared/constant';
import { Types } from 'mongoose';
import { ISubscriptionController } from '../../interfaces/controllerInterfaces/ISubscriptionController';
import { SubscriptionModel } from '@models/subscription.model';

export class SubscriptionController implements ISubscriptionController {
  private readonly _subscriptionService: ISubscriptionService;

  constructor(
    subscriptionService: ISubscriptionService,
  ) {
    this._subscriptionService = subscriptionService;

    this.createSubscription = this.createSubscription.bind(this);
    this.updateSubscription = this.updateSubscription.bind(this);
    this.getAllSubscriptions = this.getAllSubscriptions.bind(this);
    this.getAllActiveSubscriptions = this.getAllActiveSubscriptions.bind(this);
    this.getSubscriptionByName = this.getSubscriptionByName.bind(this);
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
      res.status(result.success ? HTTP_STATUS.CREATED : HTTP_STATUS.BAD_REQUEST).json({
        success: result.success,
        message: result.message || (result.success ? 'Subscription created successfully' : 'Failed to create subscription'),
        data: result.data || null,
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create subscription',
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
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? `Failed to update subscription: ${error.message}` : 'Failed to update subscription',
        data: null,
      });
    }
  }

  async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { plan, search, page, limit } = req.query;

      const query = {
        plan: plan as string | undefined,
        search: search as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this._subscriptionService.getAllSubscriptions(query);

      res.status(HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
      });
    } catch (error) {
      console.error('Get all subscriptions error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? `Failed to retrieve subscriptions: ${error.message}` : 'Failed to retrieve subscriptions',
        data: null,
      });
    }
  }

  async getAllActiveSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search } = req.query;

      const query = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string | undefined,
      };

      const result = await this._subscriptionService.getAllActiveSubscriptions(query);

      res.status(HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
      });
    } catch (error) {
      console.error('Get all active subscriptions error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? `Failed to retrieve active subscriptions: ${error.message}` : 'Failed to retrieve active subscriptions',
        data: null,
      });
    }
  }

  async getSubscriptionByName(req: Request, res: Response): Promise<void> {
    try {
      const { planName } = req.params;
      const subscription = await SubscriptionModel.findOne({
        plan: planName,
        isActive: true
      });

      if (!subscription) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Subscription plan not found',
          data: null,
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Subscription retrieved successfully',
        data: { subscription }
      });
    } catch (error) {
      console.error('Get subscription by name error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? `Failed to fetch subscription: ${error.message}` : 'Failed to fetch subscription',
        data: null,
      });
    }
  }
}