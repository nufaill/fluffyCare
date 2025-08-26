import { ISocketService } from '../../interfaces/serviceInterfaces/ISocketService';
import { getSocketHandler } from '../../shared/socket.io-handler';

export interface NewMessageData {
  chatId: string;
  messageId: string;
  senderId: string;
  senderRole: 'User' | 'Shop';
  receiverId: string;
  messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
  content?: string;
  mediaUrl?: string;
  timestamp: string;
}

export interface MessageStatusData {
  messageId: string;
  chatId: string | object;
  status: 'delivered' | 'read';
  timestamp: string;
  userId: string;
}

export interface ReactionData {
  messageId: string;
  chatId: string | object;
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
  timestamp: string;
}

export class SocketService implements ISocketService {
  private socketHandler: any | null = null;

  /**
   * Lazy-load socket handler
   */
  private getSocketHandlerSafe() {
    if (!this.socketHandler) {
      this.socketHandler = getSocketHandler();
    }
    return this.socketHandler;
  }

  emitNewMessage(data: NewMessageData): void {
    this.getSocketHandlerSafe().emitNewMessage(data);
  }

  emitMessageStatus(data: MessageStatusData): void {
    this.getSocketHandlerSafe().emitMessageStatus(data);
  }

  emitMessageReaction(data: ReactionData): void {
    this.getSocketHandlerSafe().emitMessageReaction(data);
  }

  emitChatUpdate(chatId: string, updateData: any): void {
    this.getSocketHandlerSafe().emitChatUpdate(chatId, updateData);
  }

  emitUnreadCountUpdate(userId: string, unreadCount: number): void {
    this.getSocketHandlerSafe().emitUnreadCountUpdate(userId, unreadCount);
  }

  emitUserOnlineStatus(userId: string, isOnline: boolean): void {
    this.getSocketHandlerSafe().emitUserOnlineStatus(userId, isOnline);
  }

  isUserOnline(userId: string): boolean {
    return this.getSocketHandlerSafe().isUserOnline(userId);
  }

  getOnlineUsers(): string[] {
    return this.getSocketHandlerSafe().getOnlineUsers();
  }
}
