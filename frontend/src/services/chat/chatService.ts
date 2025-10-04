import { createBaseAxios } from '@/api/base.axios';
import type { Chat } from '@/types/chat.type';

export interface ChatListResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    chats: Chat[];
    totalPages: number;
    currentPage: number;
    totalChats: number;
    hasMore?: boolean;
  };
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: Chat;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: number;
}

export class ChatService {
  private axios = createBaseAxios('/chats');

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
        400: 'Bad request. Please check your input.',
        401: 'Unauthorized access. Please login again.',
        403: 'You do not have permission to perform this action.',
        404: 'Resource not found.',
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

  async createChat(userId: string, shopId: string): Promise<Chat> {
    this.validateId(userId, 'userId');
    this.validateId(shopId, 'shopId');

    return (await this.handleRequest<ChatResponse>(
      this.axios.post('/', { userId: userId.trim(), shopId: shopId.trim() })
    )).data;
  }

  async getOrCreateChat(userId: string, shopId: string): Promise<Chat> {
    this.validateId(userId, 'userId');
    this.validateId(shopId, 'shopId');

    return (await this.handleRequest<ChatResponse>(
      this.axios.post('/get-or-create', { userId: userId.trim(), shopId: shopId.trim() })
    )).data;
  }

  async getChatById(chatId: string): Promise<Chat> {
    this.validateId(chatId, 'chatId');

    return (await this.handleRequest<ChatResponse>(
      this.axios.get(`/${chatId}`)
    )).data;
  }

  async getUserChats(userId: string, page: number = 1, limit: number = 20): Promise<ChatListResponse['data']> {
    this.validateId(userId, 'userId');
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const response = await this.handleRequest<ChatListResponse>(
      this.axios.get(`/users/${userId}/chats`, {
        params: { page: validPage, limit: validLimit },
      })
    );

    return {
      total: response.data.totalChats || 0,
      chats: response.data.chats || [],
      currentPage: response.data.currentPage || validPage,
      totalPages: Math.ceil((response.data.totalChats || 0) / validLimit),
      totalChats: response.data.totalChats || 0,
      hasMore: response.data.hasMore ?? (validPage < Math.ceil((response.data.totalChats || 0) / validLimit))
    };
  }

  async getShopChats(shopId: string, page: number = 1, limit: number = 20): Promise<ChatListResponse['data']> {
    this.validateId(shopId, 'shopId');
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const response = await this.handleRequest<ChatListResponse>(
      this.axios.get(`/shops/${shopId}/chats`, {
        params: { page: validPage, limit: validLimit },
      })
    );

    return {
      total: response.data.totalChats || 0,
      chats: response.data.chats || [],
      currentPage: response.data.currentPage || validPage,
      totalPages: Math.ceil((response.data.totalChats || 0) / validLimit),
      totalChats: response.data.totalChats || 0,
      hasMore: response.data.hasMore ?? (validPage < Math.ceil((response.data.totalChats || 0) / validLimit))
    };
  }

  async searchChats(
    query: string,
    searcherId: string,
    searcherRole: 'User' | 'Shop',
    page: number = 1,
    limit: number = 20
  ): Promise<ChatListResponse['data']> {
    this.validateId(searcherId, 'searcherId');
    if (!query?.trim()) {
      throw new Error('Search query cannot be empty');
    }
    if (!['User', 'Shop'].includes(searcherRole)) {
      throw new Error('searcherRole must be either "User" or "Shop"');
    }

    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const response = await this.handleRequest<ChatListResponse>(
      this.axios.get('/search', {
        params: {
          query: query.trim(),
          searcherId: searcherId.trim(),
          searcherRole,
          page: validPage,
          limit: validLimit,
        },
      })
    );

    return {
      total: response.data.totalChats || 0,
      chats: response.data.chats || [],
      currentPage: response.data.currentPage || validPage,
      totalPages: Math.ceil((response.data.totalChats || 0) / validLimit),
      totalChats: response.data.totalChats || 0,
      hasMore: response.data.hasMore ?? (validPage < Math.ceil((response.data.totalChats || 0) / validLimit))
    };
  }

  async searchUserChats(
    query: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ChatListResponse['data']> {
    this.validateId(userId, 'userId');
    if (!query?.trim()) {
      throw new Error('Search query cannot be empty');
    }

    return this.searchChats(query, userId, 'User', page, limit);
  }

  async searchShopChats(
    query: string,
    shopId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ChatListResponse['data']> {
    this.validateId(shopId, 'shopId');
    if (!query?.trim()) {
      throw new Error('Search query cannot be empty');
    }

    return this.searchChats(query, shopId, 'Shop', page, limit);
  }

  async getUserUnreadCount(userId: string): Promise<number> {
    this.validateId(userId, 'userId');

    return (await this.handleRequest<UnreadCountResponse>(
      this.axios.get(`/unread-count/${userId}/User`)
    )).data;
  }

  async getShopUnreadCount(shopId: string): Promise<number> {
    this.validateId(shopId, 'shopId');

    return (await this.handleRequest<UnreadCountResponse>(
      this.axios.get(`/unread-count/${shopId}/Shop`)
    )).data;
  }

  async getChatByUserAndShop(userId: string, shopId: string): Promise<Chat> {
    this.validateId(userId, 'userId');
    this.validateId(shopId, 'shopId');

    return (await this.handleRequest<ChatResponse>(
      this.axios.get('/by-user-and-shop', {
        params: { userId: userId.trim(), shopId: shopId.trim() }
      })
    )).data;
  }

  async updateLastMessage(
    chatId: string,
    lastMessage: string,
    lastMessageType: Chat['lastMessageType'],
    lastMessageAt: Date = new Date()
  ): Promise<Chat> {
    this.validateId(chatId, 'chatId');
    if (!lastMessage?.trim()) {
      throw new Error('lastMessage cannot be empty');
    }
    if (!lastMessageType) {
      throw new Error('lastMessageType is required');
    }
    if (!(lastMessageAt instanceof Date) || isNaN(lastMessageAt.getTime())) {
      throw new Error('Invalid lastMessageAt date');
    }

    return (await this.handleRequest<ChatResponse>(
      this.axios.put(`/${chatId}/last-message`, {
        lastMessage: lastMessage.trim(),
        lastMessageType,
        lastMessageAt: lastMessageAt.toISOString(),
      })
    )).data;
  }

  async incrementUnreadCount(chatId: string): Promise<Chat> {
    this.validateId(chatId, 'chatId');

    return (await this.handleRequest<ChatResponse>(
      this.axios.put(`/${chatId}/increment-unread`)
    )).data;
  }

  async resetUnreadCount(chatId: string): Promise<Chat> {
    this.validateId(chatId, 'chatId');

    return (await this.handleRequest<ChatResponse>(
      this.axios.put(`/${chatId}/reset-unread`)
    )).data;
  }

  async getTotalUnreadCount(userId: string, role: 'User' | 'Shop'): Promise<number> {
    this.validateId(userId, 'userId');
    if (!['User', 'Shop'].includes(role)) {
      throw new Error('role must be either "User" or "Shop"');
    }

    return (await this.handleRequest<UnreadCountResponse>(
      this.axios.get(`/unread-count/${userId}/${role}`)
    )).data;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    this.validateId(chatId, 'chatId');

    return (await this.handleRequest<{ success: boolean }>(
      this.axios.delete(`/${chatId}`)
    )).success;
  }
}

export const chatService = new ChatService();