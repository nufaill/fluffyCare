// services/messageService.ts
import MessageAxios from '@/api/message.axios';
import { type Message } from '@/types/message';

export interface MessageListResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    totalPages: number;
    currentPage: number;
    totalMessages: number;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { unreadCount: number };
}

export interface MessageStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalMessages: number;
    textMessages: number;
    imageMessages: number;
    videoMessages: number;
    audioMessages: number;
    fileMessages: number;
  };
}

export class MessageService {
  // Create a new message
  async createMessage(
    chatId: string,
    senderRole: 'User' | 'Shop',
    messageType: Message['messageType'],
    content: string,
    mediaUrl?: string
  ): Promise<Message> {
    const response = await MessageAxios.post<MessageResponse>('/', {
      chatId,
      senderRole,
      messageType,
      content,
      mediaUrl,
    });
    return response.data.data;
  }

  // Get message by ID
  async getMessageById(messageId: string): Promise<Message> {
    const response = await MessageAxios.get<MessageResponse>(`/${messageId}`);
    return response.data.data;
  }

  // Get chat messages with pagination
  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<MessageListResponse['data']> {
    const response = await MessageAxios.get<MessageListResponse>(`/chats/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Get latest message in chat
  async getLatestMessage(chatId: string): Promise<Message> {
    const response = await MessageAxios.get<MessageResponse>(`/chats/${chatId}/messages/latest`);
    return response.data.data;
  }

  // Mark message as delivered
  async markAsDelivered(messageId: string, deliveredAt: Date = new Date()): Promise<Message> {
    const response = await MessageAxios.put<MessageResponse>(`/${messageId}/delivered`, {
      deliveredAt: deliveredAt.toISOString(),
    });
    return response.data.data;
  }

  // Mark message as read
  async markAsRead(messageId: string, readAt: Date = new Date()): Promise<Message> {
    const response = await MessageAxios.put<MessageResponse>(`/${messageId}/read`, {
      readAt: readAt.toISOString(),
    });
    return response.data.data;
  }

  // Mark multiple messages as read
  async markMultipleAsRead(messageIds: string[], readAt: Date = new Date()): Promise<number> {
    const response = await MessageAxios.put('/mark-multiple-read', {
      messageIds,
      readAt: readAt.toISOString(),
    });
    return response.data.data.modifiedCount;
  }

  // Mark chat messages as read
  async markChatMessagesAsRead(
    chatId: string,
    receiverRole: 'User' | 'Shop',
    messageIds?: string[],
    readAt: Date = new Date()
  ): Promise<number> {
    const response = await MessageAxios.put(`/chats/${chatId}/messages/mark-read`, {
      receiverRole,
      messageIds,
      readAt: readAt.toISOString(),
    });
    return response.data.data.modifiedCount;
  }

  // Get unread count for a chat
  async getUnreadCount(chatId: string, receiverRole: 'User' | 'Shop'): Promise<number> {
    const response = await MessageAxios.get<UnreadCountResponse>(
      `/chats/${chatId}/messages/unread-count`,
      {
        params: { receiverRole },
      }
    );
    return response.data.data.unreadCount;
  }

  // Add reaction to message
  async addReaction(messageId: string, userId: string, emoji: string): Promise<Message> {
    const response = await MessageAxios.post<MessageResponse>(`/${messageId}/reactions`, {
      userId,
      emoji,
    });
    return response.data.data;
  }

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string): Promise<Message> {
    const response = await MessageAxios.delete<MessageResponse>(`/${messageId}/reactions`, {
      data: { userId },
    });
    return response.data.data;
  }

  // Search messages in a chat
  async searchMessages(
    chatId: string,
    query: string,
    messageType?: Message['messageType'],
    page: number = 1,
    limit: number = 20
  ): Promise<MessageListResponse['data']> {
    const response = await MessageAxios.get<MessageListResponse>(`/chats/${chatId}/messages/search`, {
      params: {
        query,
        messageType,
        page,
        limit,
      },
    });
    return response.data.data;
  }

  // Get messages by type
  async getMessagesByType(
    chatId: string,
    messageType: Message['messageType'],
    page: number = 1,
    limit: number = 20
  ): Promise<MessageListResponse['data']> {
    const response = await MessageAxios.get<MessageListResponse>(
      `/chats/${chatId}/messages/by-type/${messageType}`,
      {
        params: { page, limit },
      }
    );
    return response.data.data;
  }

  // Get chat message statistics
  async getChatMessageStats(chatId: string): Promise<MessageStatsResponse['data']> {
    const response = await MessageAxios.get<MessageStatsResponse>(`/chats/${chatId}/messages/stats`);
    return response.data.data;
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<boolean> {
    const response = await MessageAxios.delete(`/${messageId}`);
    return response.data.success;
  }

  // Delete all messages in a chat
  async deleteChatMessages(chatId: string): Promise<number> {
    const response = await MessageAxios.delete(`/chats/${chatId}/messages`);
    return response.data.data.deletedCount;
  }
}

export const messageService = new MessageService();