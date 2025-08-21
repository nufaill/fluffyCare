// services/chatService.ts
import ChatAxios from '@/api/chat.axios';
import type { Chat } from '@/types/chat';

export interface ChatListResponse {
  success: boolean;
  message: string;
  data: {
    chats: Chat[];
    totalPages: number;
    currentPage: number;
    totalChats: number;
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
  // Create a new chat
  async createChat(userId: string, shopId: string): Promise<Chat> {
    const response = await ChatAxios.post<ChatResponse>('/', {
      userId,
      shopId,
    });
    return response.data.data;
  }

  // Get or create chat between user and shop
  async getOrCreateChat(userId: string, shopId: string): Promise<Chat> {
    const response = await ChatAxios.post<ChatResponse>('/get-or-create', {
      userId,
      shopId,
    });
    return response.data.data;
  }

  // Get chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await ChatAxios.get<ChatResponse>(`/${chatId}`);
    return response.data.data;
  }

  // Get user's chats
  async getUserChats(userId: string, page: number = 1, limit: number = 20): Promise<ChatListResponse['data']> {
    const response = await ChatAxios.get<ChatListResponse>(`/users/${userId}/chats`, {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Get shop's chats
  async getShopChats(shopId: string, page: number = 1, limit: number = 20): Promise<ChatListResponse['data']> {
    const response = await ChatAxios.get<ChatListResponse>(`/shops/${shopId}/chats`, {
      params: { page, limit },
    });
    return response.data.data;
  }

  // Search chats
  async searchChats(
    query: string,
    searcherId: string,
    searcherRole: 'User' | 'Shop',
    page: number = 1,
    limit: number = 20
  ): Promise<ChatListResponse['data']> {
    const response = await ChatAxios.get<ChatListResponse>('/search', {
      params: {
        query,
        searcherId,
        searcherRole,
        page,
        limit,
      },
    });
    return response.data.data;
  }

  // Update last message
  async updateLastMessage(
    chatId: string,
    lastMessage: string,
    lastMessageType: Chat['lastMessageType'],
    lastMessageAt: Date = new Date()
  ): Promise<Chat> {
    const response = await ChatAxios.put<ChatResponse>(`/${chatId}/last-message`, {
      lastMessage,
      lastMessageType,
      lastMessageAt: lastMessageAt.toISOString(),
    });
    return response.data.data;
  }

  // Increment unread count
  async incrementUnreadCount(chatId: string): Promise<Chat> {
    const response = await ChatAxios.put<ChatResponse>(`/${chatId}/increment-unread`);
    return response.data.data;
  }

  // Reset unread count
  async resetUnreadCount(chatId: string): Promise<Chat> {
    const response = await ChatAxios.put<ChatResponse>(`/${chatId}/reset-unread`);
    return response.data.data;
  }

  // Get total unread count
  async getTotalUnreadCount(userId: string, role: 'User' | 'Shop'): Promise<number> {
    const response = await ChatAxios.get<UnreadCountResponse>(`/unread-count/${userId}/${role}`);
    return response.data.data;
  }

  // Delete chat
  async deleteChat(chatId: string): Promise<boolean> {
    const response = await ChatAxios.delete(`/${chatId}`);
    return response.data.success;
  }
}

export const chatService = new ChatService();