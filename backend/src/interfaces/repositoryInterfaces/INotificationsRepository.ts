import { Types } from 'mongoose';
import { CreateNotificationDTO, NotificationDTO } from '../../dto/notifications.dto';

export interface INotificationRepository {
  createNotification(data: CreateNotificationDTO): Promise<NotificationDTO>;
  updateNotification(id: Types.ObjectId, isRead: boolean): Promise<NotificationDTO | null>;
  deleteNotification(id: Types.ObjectId): Promise<boolean>;
  getUserNotifications(userId: Types.ObjectId): Promise<NotificationDTO[]>;
  getShopNotifications(shopId: Types.ObjectId): Promise<NotificationDTO[]>;
}