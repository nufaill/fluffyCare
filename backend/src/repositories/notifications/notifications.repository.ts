import { Types } from 'mongoose';
import { NotificationModel } from '../../models/notifications.model';
import { INotification } from '../../types/notifications.type';
import { NotificationDTO, CreateNotificationDTO } from '../../dto/notifications.dto';
import { INotificationRepository } from '../../interfaces/repositoryInterfaces/INotificationsRepository';

export class NotificationRepository implements INotificationRepository {
  async createNotification(data: CreateNotificationDTO): Promise<NotificationDTO> {
    const notification = await NotificationModel.create({
      ...data,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return this.toDTO(notification);
  }

  async updateNotification(id: Types.ObjectId, isRead: boolean): Promise<NotificationDTO | null> {
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { isRead, updatedAt: new Date() },
      { new: true }
    );
    
    return notification ? this.toDTO(notification) : null;
  }

  async deleteNotification(id: Types.ObjectId): Promise<boolean> {
    const result = await NotificationModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async getUserNotifications(userId: Types.ObjectId): Promise<NotificationDTO[]> {
    const notifications = await NotificationModel.find({ userId, receiverType: 'User' });
    return notifications.map(notification => this.toDTO(notification));
  }

  async getShopNotifications(shopId: Types.ObjectId): Promise<NotificationDTO[]> {
    const notifications = await NotificationModel.find({ shopId, receiverType: 'Shop' });
    return notifications.map(notification => this.toDTO(notification));
  }

  private toDTO(notification: INotification & { _id: Types.ObjectId }): NotificationDTO {
    return {
      id: notification._id.toString(),
      userId: notification.userId.toString(),
      shopId: notification.shopId.toString(),
      receiverType: notification.receiverType,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}