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
  searchUserChats(query: string, userId: string): any {
    throw new Error('Method not implemented.');
  }
  searchShopChats(query: string, shopId: string): any {
    throw new Error('Method not implemented.');
  }
  getUserUnreadCount(userId: string): any {
    throw new Error('Method not implemented.');
  }
  getShopUnreadCount(shopId: string): any {
    throw new Error('Method not implemented.');
  }
  getChatByUserAndShop(userId: string, shopId: string) {
    throw new Error('Method not implemented.');
  }
  private axios = createBaseAxios('/chats');

  private async handleRequest<T>(request: Promise<any>): Promise<T> {
    try {
      const response = await request;
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async createChat(userId: string, shopId: string): Promise<Chat> {
    if (!userId || !shopId) {
      throw new Error('userId and shopId are required');
    }

    const response = await this.handleRequest<ChatResponse>(
      this.axios.post('/', { userId, shopId })
    );
    return response.data;
  }

  async getOrCreateChat(userId: string, shopId: string): Promise<Chat> {
    if (!userId || !shopId) {
      throw new Error('userId and shopId are required');
    }

    const response = await this.handleRequest<ChatResponse>(
      this.axios.post('/get-or-create', { userId, shopId })
    );
    return response.data;
  }

  async getChatById(chatId: string): Promise<Chat> {
    if (!chatId) {
      throw new Error('chatId is required');
    }

    const response = await this.handleRequest<ChatResponse>(
      this.axios.get(`/${chatId}`)
    );
    return response.data;
  }

  async getUserChats(userId: string, page: number = 1, limit: number = 20): Promise<ChatListResponse['data']> {
    if (!userId) {
      throw new Error('userId is required');
    }
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    const response = await this.handleRequest<ChatListResponse>(
      this.axios.get(`/users/${userId}/chats`, {
        params: { page: validPage, limit: validLimit },
      })
    );
    return response.data;
  }

  async getShopChats(shopId: string, page: number = 1, limit: number = 20): Promise<ChatListResponse['data']> {
    if (!shopId) {
      throw new Error('shopId is required');
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    const response = await this.handleRequest<ChatListResponse>(
      this.axios.get(`/shops/${shopId}/chats`, {
        params: { page: validPage, limit: validLimit },
      })
    );
    return response.data;
  }

  async searchChats(
    query: string,
    searcherId: string,
    searcherRole: 'User' | 'Shop',
    page: number = 1,
    limit: number = 20
  ): Promise<ChatListResponse['data']> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }
    
    if (!searcherId) {
      throw new Error('searcherId is required');
    }

    if (!['User', 'Shop'].includes(searcherRole)) {
      throw new Error('searcherRole must be either User or Shop');
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));

    const response = await this.handleRequest<ChatListResponse>(
      this.axios.get('/search', {
        params: {
          query: query.trim(),
          searcherId,
          searcherRole,
          page: validPage,
          limit: validLimit,
        },
      })
    );
    return response.data;
  }

  async updateLastMessage(
    chatId: string,
    lastMessage: string,
    lastMessageType: Chat['lastMessageType'],
    lastMessageAt: Date = new Date()
  ): Promise<Chat> {
    if (!chatId) {
      throw new Error('chatId is required');
    }

    if (!lastMessage || lastMessage.trim().length === 0) {
      throw new Error('lastMessage cannot be empty');
    }

    if (!lastMessageType) {
      throw new Error('lastMessageType is required');
    }

    const response = await this.handleRequest<ChatResponse>(
      this.axios.put(`/${chatId}/last-message`, {
        lastMessage: lastMessage.trim(),
        lastMessageType,
        lastMessageAt: lastMessageAt.toISOString(),
      })
    );
    return response.data;
  }

  async incrementUnreadCount(chatId: string): Promise<Chat> {
    if (!chatId) {
      throw new Error('chatId is required');
    }

    const response = await this.handleRequest<ChatResponse>(
      this.axios.put(`/${chatId}/increment-unread`)
    );
    return response.data;
  }

  async resetUnreadCount(chatId: string): Promise<Chat> {
    if (!chatId) {
      throw new Error('chatId is required');
    }

    const response = await this.handleRequest<ChatResponse>(
      this.axios.put(`/${chatId}/reset-unread`)
    );
    return response.data;
  }

  async getTotalUnreadCount(userId: string, role: 'User' | 'Shop'): Promise<number> {
    if (!userId) {
      throw new Error('userId is required');
    }

    if (!['User', 'Shop'].includes(role)) {
      throw new Error('role must be either User or Shop');
    }

    const response = await this.handleRequest<UnreadCountResponse>(
      this.axios.get(`/unread-count/${userId}/${role}`)
    );
    return response.data;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    if (!chatId) {
      throw new Error('chatId is required');
    }

    const response = await this.handleRequest<{ success: boolean }>(
      this.axios.delete(`/${chatId}`)
    );
    return response.success;
  }
}

export const chatService = new ChatService();