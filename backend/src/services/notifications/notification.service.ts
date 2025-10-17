import { Types } from 'mongoose';
import { INotificationRepository } from '../../interfaces/repositoryInterfaces/INotificationsRepository';
import { CreateNotificationDTO, NotificationDTO } from '../../dto/notifications.dto';
import { INotificationService } from '../../interfaces/serviceInterfaces/INotificationService';

export class NotificationService implements INotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this._notificationRepository = notificationRepository;
  }

  async createNotification(data: CreateNotificationDTO): Promise<NotificationDTO> {
    try {
      return await this._notificationRepository.createNotification(data);
    } catch (error) {
      console.error('Error in createNotification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async updateNotification(id: Types.ObjectId, isRead: boolean): Promise<NotificationDTO | null> {
    try {
      return await this._notificationRepository.updateNotification(id, isRead);
    } catch (error) {
      console.error('Error in updateNotification:', error);
      throw new Error('Failed to update notification');
    }
  }

  async deleteNotification(id: Types.ObjectId): Promise<boolean> {
    try {
      return await this._notificationRepository.deleteNotification(id);
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async getUserNotifications(userId: Types.ObjectId): Promise<NotificationDTO[]> {
    try {
      return await this._notificationRepository.getUserNotifications(userId);
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      throw new Error('Failed to fetch user notifications');
    }
  }

  async getShopNotifications(shopId: Types.ObjectId): Promise<NotificationDTO[]> {
    try {
      return await this._notificationRepository.getShopNotifications(shopId);
    } catch (error) {
      console.error('Error in getShopNotifications:', error);
      throw new Error('Failed to fetch shop notifications');
    }
  }
}