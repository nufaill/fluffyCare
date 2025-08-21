// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { messageService } from '@/services/chat/messageService';
import {type Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';

export interface UseMessagesOptions {
  chatId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useMessages = (options: UseMessagesOptions) => {
  const { chatId, autoRefresh = false, refreshInterval = 5000 } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
  });
  const { toast } = useToast();

  const fetchMessages = useCallback(async (page: number = 1, limit: number = 50, append: boolean = false) => {
    if (!chatId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getChatMessages(chatId, page, limit);
      
      if (append) {
        setMessages(prev => [...response.messages, ...prev]);
      } else {
        setMessages(response.messages);
      }
      
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalMessages: response.totalMessages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, toast]);

  const sendMessage = useCallback(async (
    senderRole: 'User' | 'Shop',
    messageType: Message['messageType'],
    content: string,
    mediaUrl?: string
  ): Promise<Message | null> => {
    if (!chatId) return null;

    try {
      const message = await messageService.createMessage(chatId, senderRole, messageType, content, mediaUrl);
      
      // Add message to local state
      setMessages(prev => [...prev, message]);
      
      return message;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return null;
    }
  }, [chatId, toast]);

  const addReaction = useCallback(async (messageId: string, userId: string, emoji: string): Promise<void> => {
    try {
      const updatedMessage = await messageService.addReaction(messageId, userId, emoji);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.chatId === updatedMessage.chatId ? updatedMessage : msg
      ));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const removeReaction = useCallback(async (messageId: string, userId: string): Promise<void> => {
    try {
      const updatedMessage = await messageService.removeReaction(messageId, userId);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.chatId === updatedMessage.chatId ? updatedMessage : msg
      ));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const markMessagesAsRead = useCallback(async (receiverRole: 'User' | 'Shop', messageIds?: string[]): Promise<void> => {
    if (!chatId) return;

    try {
      await messageService.markChatMessagesAsRead(chatId, receiverRole, messageIds);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        (!messageIds || messageIds.includes(msg.chatId)) && msg.senderRole !== receiverRole
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      ));
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [chatId]);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      await messageService.deleteMessage(messageId);
      
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.chatId !== messageId));
      
      toast({
        description: 'Message deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const searchMessages = useCallback(async (
    query: string,
    messageType?: Message['messageType'],
    page: number = 1,
    limit: number = 20
  ) => {
    if (!chatId) return;

    setLoading(true);
    try {
      const response = await messageService.searchMessages(chatId, query, messageType, page, limit);
      setMessages(response.messages);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalMessages: response.totalMessages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to search messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [fetchMessages]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0 && chatId) {
      const interval = setInterval(() => {
        fetchMessages(1, 50, false);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, chatId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    pagination,
    fetchMessages,
    sendMessage,
    addReaction,
    removeReaction,
    markMessagesAsRead,
    deleteMessage,
    searchMessages,
  };
};