// useChats.ts
import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/chat/chatService';
import { type Chat } from '@/types/chat.type';
import { useToast } from '@/hooks/use-toast';
import { cleanChatObject, debugChatObject, isValidChatObject } from '@/utils/helpers/chatHelpers';
import { connectSocket, addEventListener, removeEventListener } from '@/components/shared/socket.io-client';

export interface UseChatOptions {
  userId?: string;
  shopId?: string;
  userType: 'user' | 'shop';
}

export const useChats = (options: UseChatOptions) => {
  const { userId, shopId, userType } = options;
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
      } else {
        throw new Error('Invalid user type or ID');
      }

      if (response) {
        const processed = processChatData(response.chats);
        setChats(processed);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.total / limit),
          totalChats: response.total,
        });
      } else {
        setChats([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chats');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch chats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, shopId, userType, processChatData, toast]);

  const searchChats = useCallback(async (query: string) => {
    if (!query.trim()) {
      return fetchChats();
    }

    if (!userId && !shopId) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (userType === 'user' && userId) {
        response = await chatService.searchUserChats(query, userId);
      } else if (userType === 'shop' && shopId) {
        response = await chatService.searchShopChats(query, shopId);
      } else {
        throw new Error('Invalid user type or ID');
      }

      if (response) {
        const processed = processChatData(response.chats);
        setChats(processed);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalChats: response.total,
        });
      } else {
        setChats([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search chats');
      toast({
        title: 'Error',
        description: err.message || 'Failed to search chats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId, shopId, userType, fetchChats, processChatData, toast]);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId && !shopId) return;

    try {
      let count;
      if (userType === 'user' && userId) {
        count = await chatService.getUserUnreadCount(userId);
      } else if (userType === 'shop' && shopId) {
        count = await chatService.getShopUnreadCount(shopId);
      }
      if (count !== undefined) {
        setTotalUnreadCount(count);
      }
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [userId, shopId, userType]);

  const createOrGetChat = useCallback(async (userId: string, shopId: string): Promise<Chat | null> => {
    try {
      let chat = await chatService.getChatByUserAndShop(userId, shopId);
      
      if (!chat) {
        chat = await chatService.createChat(userId, shopId);
      }
      
      if (!chat) {
        toast({
          title: 'Error',
          description: 'Failed to create or get chat',
          variant: 'destructive',
        });
        return null;
      }

      // Debug and clean the retrieved chat
      debugChatObject(chat, 'New/Existing Chat');
      const cleanedChat = cleanChatObject(chat);
      
      if (!cleanedChat) {
        console.error('Failed to clean newly created/retrieved chat:', chat);
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

  // Socket event handlers for real-time updates
  const handleMessageNotification = useCallback((data: any) => {
    console.log('Handling message notification:', data);
    // If the chat exists, update lastMessage and increment unread
    setChats(prev => prev.map(chat => {
      const currentChatId = chat._id || chat.id || `${chat.userId}-${chat.shopId}`;
      if (currentChatId === data.chatId) {
        return {
          ...chat,
          lastMessage: data.content || `[${data.messageType}]`,
          lastMessageType: data.messageType,
          lastMessageAt: new Date(data.timestamp),
          unreadCount: (chat.unreadCount || 0) + 1,
        };
      }
      return chat;
    }));
    refreshChats();
  }, [refreshChats]);

  const handleChatUpdated = useCallback((data: any) => {
    console.log('Handling chat updated:', data);
    setChats(prev => prev.map(chat => {
      const currentChatId = chat._id || chat.id || `${chat.userId}-${chat.shopId}`;
      if (currentChatId === data.chatId) {
        return { ...chat, ...data };
      }
      return chat;
    }));
  }, []);

  const handleUnreadCountUpdate = useCallback((data: any) => {
    console.log('Handling unread count update:', data);
    if (data.userId === (userId || shopId)) {
      setTotalUnreadCount(data.unreadCount);
    }
  }, [userId, shopId]);

  useEffect(() => {
    if (userId || shopId) {
      connectSocket(userId || shopId, userType === 'user' ? 'User' : 'Shop')
        .then(() => {
          console.log('Socket connected for chats');
        })
        .catch(err => {
          console.error('Failed to connect socket for chats:', err);
        });

      fetchChats();
      fetchUnreadCount();

      // Add real-time listeners
      addEventListener('message-notification', handleMessageNotification);
      addEventListener('chat-updated', handleChatUpdated);
      addEventListener('unread-count-update', handleUnreadCountUpdate);

      return () => {
        removeEventListener('message-notification', handleMessageNotification);
        removeEventListener('chat-updated', handleChatUpdated);
        removeEventListener('unread-count-update', handleUnreadCountUpdate);
      };
    }
  }, [userId, shopId, userType, fetchChats, fetchUnreadCount, handleMessageNotification, handleChatUpdated, handleUnreadCountUpdate]);

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