import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/chat/chatService';
import { type Chat } from '@/types/chat.type';
import { useToast } from '@/hooks/use-toast';
import { cleanChatObject, debugChatObject, isValidChatObject } from '@/utils/helpers/chatHelpers';

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

  // Helper function to clean and validate chat data
  const processChatData = useCallback((rawChats: any[]): Chat[] => {
    if (!Array.isArray(rawChats)) {
      console.error('processChatData: Expected array, got:', typeof rawChats, rawChats);
      return [];
    }

    const processedChats: Chat[] = [];

    rawChats.forEach((rawChat, index) => {
      try {
        // Debug the raw chat object
        debugChatObject(rawChat, `Raw Chat ${index + 1}`);

        // Try to clean the chat object
        const cleanedChat = cleanChatObject(rawChat);
        
        if (cleanedChat && isValidChatObject(cleanedChat)) {
          processedChats.push(cleanedChat);
        } else {
          console.error(`🚫 Chat ${index + 1} failed validation and cleaning:`, rawChat);
          // Still include it but log the issue
          processedChats.push(rawChat);
        }
      } catch (error) {
        console.error(`Error processing chat ${index + 1}:`, error, rawChat);
        // Include the raw chat as fallback
        processedChats.push(rawChat);
      }
    });

    return processedChats;
  }, []);

  const fetchChats = useCallback(async (page: number = 1, limit: number = 20) => {
    if (!userId && !shopId) {
      console.warn('fetchChats: No userId or shopId provided');
      return;
    }

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
        const processedChats = processChatData(response.chats);
        
        if (page === 1) {
          setChats(processedChats);
        } else {
          setChats(prev => [...prev, ...processedChats]);
        }

        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalChats: response.totalChats,
        });
      }
    } catch (err: any) {
      console.error('fetchChats: Error:', err);
      setError(err.message || 'Failed to fetch chats');
      toast({
        title: 'Error',
        description: 'Failed to load chats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, shopId, userType, toast, processChatData]);

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
      
      // Process the search results
      const processedChats = processChatData(response.chats);
      
      if (page === 1) {
        setChats(processedChats);
      } else {
        setChats(prev => [...prev, ...processedChats]);
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
  }, [userId, shopId, userType, toast, processChatData]);

  const createOrGetChat = useCallback(async (targetUserId: string, targetShopId: string): Promise<Chat | null> => {
    try {
      const rawChat = await chatService.getOrCreateChat(targetUserId, targetShopId);
      
      // Debug and clean the returned chat
      debugChatObject(rawChat, 'New/Existing Chat');
      const cleanedChat = cleanChatObject(rawChat);
      
      if (!cleanedChat) {
        console.error('Failed to clean newly created/retrieved chat:', rawChat);
        toast({
          title: 'Error',
          description: 'Retrieved chat data is corrupted',
          variant: 'destructive',
        });
        return null;
      }

      const chatId = cleanedChat._id || cleanedChat.id || `${cleanedChat.userId}-${cleanedChat.shopId}`;
      
      setChats(prev => {
        const existingIndex = prev.findIndex(c => {
          const existingChatId = c._id || c.id || `${c.userId}-${c.shopId}`;
          return existingChatId === chatId;
        });
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = cleanedChat;
          return updated;
        }
        return [cleanedChat, ...prev];
      });

      return cleanedChat;
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
      setChats(prev => prev.map(chat => {
        const currentChatId = chat._id || chat.id || `${chat.userId}-${chat.shopId}`;
        return currentChatId === chatId 
          ? { ...chat, unreadCount: 0 }
          : chat;
      }));
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