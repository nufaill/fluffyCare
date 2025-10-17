import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { INotificationService } from '../../interfaces/serviceInterfaces/INotificationService';
import { CreateNotificationDTO, NotificationDTO } from '../../dto/notifications.dto';

export interface INotificationController {
  createNotification(req: Request, res: Response): Promise<void>;
  updateNotification(req: Request, res: Response): Promise<void>;
  deleteNotification(req: Request, res: Response): Promise<void>;
  getUserNotifications(req: Request, res: Response): Promise<void>;
  getShopNotifications(req: Request, res: Response): Promise<void>;
}

export class NotificationController implements INotificationController {
  private _notificationService: INotificationService;

  constructor(notificationService: INotificationService) {
    this._notificationService = notificationService;
  }

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateNotificationDTO = {
        userId: new Types.ObjectId(req.body.userId),
        shopId: new Types.ObjectId(req.body.shopId),
        receiverType: req.body.receiverType,
        type: req.body.type,
        message: req.body.message,
      };

      const notification = await this._notificationService.createNotification(data);
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: (error as Error).message,
      });
    }
  }

  async updateNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      const { isRead } = req.body;

      if (!Types.ObjectId.isValid(notificationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid notification ID format',
        });
        return;
      }

      const objectId = new Types.ObjectId(notificationId);

      const notification = await this._notificationService.updateNotification(objectId, isRead);

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification updated successfully',
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
      });
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      // Validate if the ID is a valid MongoDB ObjectId
      if (!Types.ObjectId.isValid(notificationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid notification ID format',
        });
        return;
      }

      // Convert string to ObjectId
      const objectId = new Types.ObjectId(notificationId);

      const result = await this._notificationService.deleteNotification(objectId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
      });
    }
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.params.userId);
      const notifications = await this._notificationService.getUserNotifications(userId);
      res.status(200).json({
        success: true,
        data: notifications,
        message: 'User notifications fetched successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user notifications',
        error: (error as Error).message,
      });
    }
  }

  async getShopNotifications(req: Request, res: Response): Promise<void> {
    try {
      const shopId = new Types.ObjectId(req.params.shopId);
      const notifications = await this._notificationService.getShopNotifications(shopId);
      res.status(200).json({
        success: true,
        data: notifications,
        message: 'Shop notifications fetched successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shop notifications',
        error: (error as Error).message,
      });
    }
  }
}