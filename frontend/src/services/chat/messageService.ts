import { createBaseAxios } from '@/api/base.axios';
import { type Message } from '@/types/message.type';

interface MessageListResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    total: number;
    data: any;
    messages: Message[];
    totalPages: number;
    currentPage: number;
    totalMessages: number;
    hasMore?: boolean;
  };
}

interface MessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { unreadCount: number };
}

interface MessageStatsResponse {
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
  private axios = createBaseAxios('/messages');
  private validMessageTypes = ['Text', 'Image', 'Video', 'Audio', 'File'];

  private async handleRequest<T>(request: Promise<any>): Promise<T> {
    try {
      const response = await request;
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Request failed');
      }
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const messages: { [key: number]: string } = {
        401: 'Unauthorized access. Please login again.',
        403: 'You do not have permission to perform this action.',
        404: 'Chat or message not found.',
        500: 'Server error. Please try again later.'
      };
      throw new Error(messages[status] || error.response?.data?.message || error.message || 'An unexpected error occurred');
    }
  }

  private validateId(id: string, name: string): void {
    if (!id?.trim()) {
      throw new Error(`${name} is required and must be a non-empty string`);
    }
  }

  private validateMessageType(messageType: string): void {
    if (!this.validMessageTypes.includes(messageType)) {
      throw new Error(`Invalid message type: ${messageType}. Must be one of: ${this.validMessageTypes.join(', ')}`);
    }
  }

  async createMessage(
    chatId: string,
    senderRole: 'User' | 'Shop',
    messageType: Message['messageType'] = 'Text',
    content: string,
    mediaUrl?: string
  ): Promise<Message> {
    this.validateId(chatId, 'chatId');
    if (!['User', 'Shop'].includes(senderRole)) {
      throw new Error('senderRole must be either "User" or "Shop"');
    }
    this.validateMessageType(messageType);

    if (messageType === 'Text') {
      if (!content?.trim()) {
        throw new Error('Content is required for text messages');
      }
      if (content.trim().length > 10000) {
        throw new Error('Message content cannot exceed 10000 characters');
      }
    } else if (!mediaUrl?.trim()) {
      throw new Error(`Media URL is required for ${messageType.toLowerCase()} messages`);
    }

    const payload = {
      chatId,
      senderRole,
      messageType,
      content: content?.trim() || '',
      ...(mediaUrl && { mediaUrl: mediaUrl.trim() })
    };

    return (await this.handleRequest<MessageResponse>(this.axios.post('/', payload))).data;
  }

  async getChatMessages(
    chatId: string,
    page: number = 1,
    limit: number = 50,
    since?: Date
  ): Promise<MessageListResponse['data']> {
    this.validateId(chatId, 'chatId');
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const response = await this.handleRequest<MessageListResponse>(
      this.axios.get(`/chats/${chatId}/messages`, {
        params: { page: validPage, limit: validLimit, ...(since && { since: since.toISOString() }) }
      })
    );

    const mappedMessages = response.data.messages.map((msg: any) => ({
      ...msg,
      _id: msg.id || msg._id,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt),
      deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
      readAt: msg.readAt ? new Date(msg.readAt) : undefined,
    })) as Message[];

    return {
      page: response.data.page || validPage,
      total: response.data.total || 0,
      data: mappedMessages,
      messages: mappedMessages.filter((msg): msg is Message => !!msg && !!msg._id),
      currentPage: response.data.page || validPage,
      totalPages: Math.ceil((response.data.total || 0) / validLimit),
      totalMessages: response.data.total || 0,
      hasMore: response.data.hasMore,
    };
  }


  async getLatestMessage(chatId: string): Promise<Message> {
    this.validateId(chatId, 'chatId');
    const response = await this.handleRequest<MessageResponse>(this.axios.get(`/chats/${chatId}/messages/latest`));

    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt || Date.now()),
      updatedAt: new Date(response.data.updatedAt || Date.now()),
      deliveredAt: response.data.deliveredAt ? new Date(response.data.deliveredAt) : undefined,
      readAt: response.data.readAt ? new Date(response.data.readAt) : undefined
    };
  }

  async markAsDelivered(messageId: string, deliveredAt: Date = new Date()): Promise<Message> {
    this.validateId(messageId, 'messageId');
    return (await this.handleRequest<MessageResponse>(
      this.axios.put(`/${messageId}/delivered`, { deliveredAt: deliveredAt.toISOString() })
    )).data;
  }

  async markAsRead(messageId: string, readAt: Date = new Date()): Promise<Message> {
    this.validateId(messageId, 'messageId');
    return (await this.handleRequest<MessageResponse>(
      this.axios.put(`/${messageId}/read`, { readAt: readAt.toISOString() })
    )).data;
  }

  async markMultipleAsRead(messageIds: string[], readAt: Date = new Date()): Promise<number> {
    if (!Array.isArray(messageIds) || !messageIds.length) {
      throw new Error('messageIds must be a non-empty array');
    }
    const validMessageIds = messageIds.filter(id => id?.trim()).map(id => id.trim());
    if (!validMessageIds.length) {
      throw new Error('No valid message IDs provided');
    }

    return (await this.handleRequest<{ data: { modifiedCount: number } }>(
      this.axios.put('/mark-multiple-read', { messageIds: validMessageIds, readAt: readAt.toISOString() })
    )).data.modifiedCount;
  }

  async markChatMessagesAsRead(
    chatId: string,
    receiverRole: 'User' | 'Shop',
    messageIds?: string[],
    readAt: Date = new Date()
  ): Promise<number> {
    this.validateId(chatId, 'chatId');
    if (!['User', 'Shop'].includes(receiverRole)) {
      throw new Error('receiverRole must be either "User" or "Shop"');
    }

    const validMessageIds = messageIds?.filter(id => id?.trim()).map(id => id.trim());
    if (messageIds && !validMessageIds?.length) {
      throw new Error('No valid message IDs provided');
    }

    return (await this.handleRequest<{ data: { modifiedCount: number } }>(
      this.axios.put(`/chats/${chatId}/messages/mark-read`, {
        receiverRole,
        ...(validMessageIds?.length && { messageIds: validMessageIds }),
        readAt: readAt.toISOString()
      })
    )).data.modifiedCount;
  }

  async getUnreadCount(chatId: string, receiverRole: 'User' | 'Shop'): Promise<number> {
    this.validateId(chatId, 'chatId');
    if (!['User', 'Shop'].includes(receiverRole)) {
      throw new Error('receiverRole must be either "User" or "Shop"');
    }

    return (await this.handleRequest<UnreadCountResponse>(
      this.axios.get(`/chats/${chatId}/messages/unread-count`, { params: { receiverRole } })
    )).data.unreadCount;
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<Message> {
    this.validateId(messageId, 'messageId');
    this.validateId(userId, 'userId');
    if (!emoji?.trim() || emoji.length > 10) {
      throw new Error('emoji is required and cannot exceed 10 characters');
    }

    return (await this.handleRequest<MessageResponse>(
      this.axios.post(`/${messageId}/reactions`, { userId, emoji: emoji.trim() })
    )).data;
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<Message> {
    this.validateId(messageId, 'messageId');
    this.validateId(userId, 'userId');

    return (await this.handleRequest<MessageResponse>(
      this.axios.delete(`/${messageId}/reactions`, { data: { userId } })
    )).data;
  }

  async searchMessages(
    chatId: string,
    query: string,
    messageType?: Message['messageType'],
    page: number = 1,
    limit: number = 20
  ): Promise<MessageListResponse['data']> {
    this.validateId(chatId, 'chatId');
    if (!query?.trim()) {
      throw new Error('Search query cannot be empty');
    }
    if (messageType && !this.validMessageTypes.includes(messageType)) {
      throw new Error('Invalid message type');
    }

    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    return await (await this.handleRequest<MessageListResponse>(
      this.axios.get(`/chats/${chatId}/messages/search`, {
        params: { query: query.trim(), messageType, page: validPage, limit: validLimit }
      })
    )).data;
  }

  async getMessagesByType(
    chatId: string,
    messageType: Message['messageType'],
    page: number = 1,
    limit: number = 20
  ): Promise<MessageListResponse['data']> {
    this.validateId(chatId, 'chatId');
    this.validateId(messageType, 'messageType');
    this.validateMessageType(messageType);

    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    return await (await this.handleRequest<MessageListResponse>(
      this.axios.get(`/chats/${chatId}/messages/by-type/${messageType}`, {
        params: { page: validPage, limit: validLimit }
      })
    )).data;
  }

  async getChatMessageStats(chatId: string): Promise<MessageStatsResponse['data']> {
    this.validateId(chatId, 'chatId');
    return (await this.handleRequest<MessageStatsResponse>(
      this.axios.get(`/chats/${chatId}/messages/stats`)
    )).data;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    this.validateId(messageId, 'messageId');
    return (await this.handleRequest<{ success: boolean }>(this.axios.delete(`/${messageId}`))).success;
  }

  async deleteChatMessages(chatId: string): Promise<number> {
    this.validateId(chatId, 'chatId');
    return (await this.handleRequest<{ data: { deletedCount: number } }>(
      this.axios.delete(`/chats/${chatId}/messages`)
    )).data.deletedCount;
  }
}

export const messageService = new MessageService();