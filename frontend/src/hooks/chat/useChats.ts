// hooks/useChats.ts
import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/chat/chatService';
import { type Chat } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export interface UseChatOptions {
  userId?: string;
  shopId?: string;
  userType: 'user' | 'shop';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useChats = (options: UseChatOptions) => {
  const { userId, shopId, userType, autoRefresh = false, refreshInterval = 30000 } = options;
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChats: 0,
  });
  const { toast } = useToast();

  const fetchChats = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!userId && !shopId) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (userType === 'user' && userId) {
        response = await chatService.getUserChats(userId, page, limit);
      } else if (userType === 'shop' && shopId) {
        response = await chatService.getShopChats(shopId, page, limit);
      }

      if (response) {
        if (page === 1) {
          setChats(response.chats);
        } else {
          setChats(prev => [...prev, ...response.chats]);
        }
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalChats: response.totalChats,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chats');
      toast({
        title: 'Error',
        description: 'Failed to load chats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, shopId, userType, toast]);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId && !shopId) return;

    try {
      const id = userType === 'user' ? userId! : shopId!;
      const role = userType === 'user' ? 'User' : 'Shop';
      const count = await chatService.getTotalUnreadCount(id, role);
      setTotalUnreadCount(count);
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [userId, shopId, userType]);

  const searchChats = useCallback(async (query: string, page: number = 1, limit: number = 20) => {
    if (!userId && !shopId) return;

    setLoading(true);
    setError(null);

    try {
      const id = userType === 'user' ? userId! : shopId!;
      const role = userType === 'user' ? 'User' : 'Shop';
      const response = await chatService.searchChats(query, id, role, page, limit);
      
      if (page === 1) {
        setChats(response.chats);
      } else {
        setChats(prev => [...prev, ...response.chats]);
      }
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalChats: response.totalChats,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to search chats');
      toast({
        title: 'Error',
        description: 'Failed to search chats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, shopId, userType, toast]);

  const createOrGetChat = useCallback(async (targetUserId: string, targetShopId: string): Promise<Chat | null> => {
    try {
      const chat = await chatService.getOrCreateChat(targetUserId, targetShopId);
      
      // Add to existing chats if not already present
      setChats(prev => {
        const existingIndex = prev.findIndex(c => c.userId === chat.userId && c.shopId === chat.shopId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = chat;
          return updated;
        }
        return [chat, ...prev];
      });

      return chat;
    } catch (err: any) {
      setError(err.message || 'Failed to create chat');
      toast({
        title: 'Error',
        description: 'Failed to create chat',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const markChatAsRead = useCallback(async (chatId: string) => {
    try {
      await chatService.resetUnreadCount(chatId);
      
      // Update local state
      setChats(prev => prev.map(chat => 
        `${chat.userId}-${chat.shopId}` === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      ));
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (err: any) {
      console.error('Failed to mark chat as read:', err);
    }
  }, [fetchUnreadCount]);

  const refreshChats = useCallback(() => {
    fetchChats(1);
    fetchUnreadCount();
  }, [fetchChats, fetchUnreadCount]);

  useEffect(() => {
    if (userId || shopId) {
      fetchChats();
      fetchUnreadCount();
    }
  }, [fetchChats, fetchUnreadCount]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshChats();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshChats]);

  return {
    chats,
    loading,
    error,
    totalUnreadCount,
    pagination,
    fetchChats,
    searchChats,
    createOrGetChat,
    markChatAsRead,
    refreshChats,
  };
};
