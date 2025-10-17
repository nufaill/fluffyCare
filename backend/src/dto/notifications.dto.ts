import { Types } from 'mongoose';
import { ReceiverType, NotificationType } from '../types/notifications.type';

export interface NotificationDTO {
  id: string;
  userId: string;
  shopId: string;
  receiverType: ReceiverType;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDTO {
  userId: Types.ObjectId;
  shopId: Types.ObjectId;
  receiverType: ReceiverType;
  type: NotificationType;
  message: string;
}