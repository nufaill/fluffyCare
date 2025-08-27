// useMessages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { messageService } from '@/services/chat/messageService';
import { type Message } from '@/types/message.type';
import { useToast } from '@/hooks/use-toast';
import {
  joinChat,
  leaveChat,
  addEventListener,
  removeEventListener,
  isSocketConnected,
  getSocket,
} from '@/components/shared/socket.io-client';

interface UseMessagesOptions {
  chatId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  userId?: string;
  currentRole?: 'User' | 'Shop';
}

interface SocketMessage {
  _id: string;
  chatId: string;
  senderRole: 'User' | 'Shop';
  messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  deliveredAt?: string;
  readAt?: string;
  reactions: any[];
  createdAt: string;
  updatedAt: string;
}

export const useMessages = ({
  chatId,
  autoRefresh = false,
  refreshInterval = 10000,
  userId,
  currentRole,
}: UseMessagesOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
  });

  const { toast } = useToast();
  const lastMessageTimestamp = useRef<string | null>(null);

  const transformSocketMessage = useCallback((socketMessage: SocketMessage): Message => {
    console.log('Transforming socket message:', socketMessage);
    return {
      _id: socketMessage._id,
      chatId: socketMessage.chatId,
      senderRole: socketMessage.senderRole,
      messageType: socketMessage.messageType,
      content: socketMessage.content || '',
      mediaUrl: socketMessage.mediaUrl,
      isRead: socketMessage.isRead,
      deliveredAt: socketMessage.deliveredAt ? new Date(socketMessage.deliveredAt) : undefined,
      readAt: socketMessage.readAt ? new Date(socketMessage.readAt) : undefined,
      reactions: socketMessage.reactions || [],
      createdAt: new Date(socketMessage.createdAt || Date.now()),
      updatedAt: new Date(socketMessage.updatedAt || Date.now()),
    };
  }, []);

  const sortMessages = (msgs: Message[]) => {
    return [...msgs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const fetchMessages = useCallback(async (page: number = 1, limit: number = 50, append: boolean = false) => {
    if (!chatId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getChatMessages(chatId, page, limit);

      if (!response?.messages) {
        throw new Error('Invalid message data received');
      }

      const mappedMessages: Message[] = response.messages.map((msg: any) => ({
        _id: msg.id || msg._id,
        chatId: msg.chatId,
        senderRole: msg.senderRole,
        messageType: msg.messageType,
        content: msg.content || '',
        mediaUrl: msg.mediaUrl,
        isRead: msg.isRead,
        deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
        readAt: msg.readAt ? new Date(msg.readAt) : undefined,
        reactions: msg.reactions || [],
        createdAt: new Date(msg.createdAt || Date.now()),
        updatedAt: new Date(msg.updatedAt || Date.now()),
      }));

      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m._id));
        const uniqueNew = append ? mappedMessages.filter(m => !existingIds.has(m._id)) : mappedMessages;
        const newList = append ? [...prev, ...uniqueNew] : uniqueNew;
        return sortMessages(newList);
      });

      setPagination({
        currentPage: response.page || response.currentPage || page,
        totalPages: Math.ceil((response.total || response.totalMessages || 0) / limit),
        totalMessages: response.total || response.totalMessages || 0,
      });

      if (mappedMessages.length > 0) {
        lastMessageTimestamp.current = mappedMessages[mappedMessages.length - 1].createdAt.toISOString();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, toast]);

  const fetchNewMessages = useCallback(async () => {
    if (!chatId || loading || sending || !lastMessageTimestamp.current) {
      return fetchMessages();
    }

    setLoading(true);
    try {
      const sinceDate = new Date(lastMessageTimestamp.current);
      sinceDate.setMilliseconds(sinceDate.getMilliseconds() + 1);

      const response = await messageService.getChatMessages(chatId, 1, 50, sinceDate);
      const newMessages = response.messages || [];

      const mappedMessages: Message[] = newMessages.map((msg: any) => ({
        _id: msg.id || msg._id,
        chatId: msg.chatId,
        senderRole: msg.senderRole,
        messageType: msg.messageType,
        content: msg.content || '',
        mediaUrl: msg.mediaUrl,
        isRead: msg.isRead,
        deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
        readAt: msg.readAt ? new Date(msg.readAt) : undefined,
        reactions: msg.reactions || [],
        createdAt: new Date(msg.createdAt || Date.now()),
        updatedAt: new Date(msg.updatedAt || Date.now()),
      }));

      if (mappedMessages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m._id));
          const uniqueNew = mappedMessages.filter(m => !existingIds.has(m._id));
          const newList = [...prev, ...uniqueNew];
          return sortMessages(newList);
        });
        lastMessageTimestamp.current = mappedMessages[mappedMessages.length - 1].createdAt.toISOString();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch new messages');
    } finally {
      setLoading(false);
    }
  }, [chatId, fetchMessages, loading, sending]);

  const sendMessage = useCallback(async (
    senderRole: 'User' | 'Shop',
    messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
    content: string,
    mediaUrl?: string
  ) => {
    if (!chatId) return null;

    setSending(true);
    try {
      const newMessage = await messageService.createMessage(chatId, senderRole, messageType, content, mediaUrl);
      setMessages(prev => sortMessages([...prev, newMessage]));
      if (newMessage.createdAt) {
        lastMessageTimestamp.current = newMessage.createdAt.toISOString();
      }
      return newMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      return null;
    } finally {
      setSending(false);
    }
  }, [chatId]);

  const addReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    if (!chatId) return;

    try {
      const updatedMessage = await messageService.addReaction(messageId, userId, emoji);
      setMessages(prev => sortMessages(prev.map(m => m._id === updatedMessage._id ? updatedMessage : m)));
    } catch (err: any) {
      setError(err.message || 'Failed to add reaction');
    }
  }, [chatId]);

  const removeReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    if (!chatId) return;

    try {
      const updatedMessage = await messageService.removeReaction(messageId, userId, emoji);
      setMessages(prev => sortMessages(prev.map(m => m._id === updatedMessage._id ? updatedMessage : m)));
    } catch (err: any) {
      setError(err.message || 'Failed to remove reaction');
    }
  }, [chatId]);

  const markMessagesAsRead = useCallback(async (messageIds: string[], receiverRole : 'User' | 'Shop') => {
    try {
      await messageService.markMultipleAsRead(messageIds, new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to mark messages as read');
      throw err;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      throw err;
    }
  }, []);

  const searchMessages = useCallback(async (
    query: string,
    messageType?: Message['messageType'],
    page: number = 1,
    limit: number = 20
  ) => {
    if (!chatId || !query) return;

    setLoading(true);
    try {
      const response = await messageService.searchMessages(chatId, query, messageType, page, limit);
      const messages = response.messages || [];

      const mappedMessages: Message[] = messages.map((msg: any) => ({
        _id: msg.id || msg._id,
        chatId: msg.chatId,
        senderRole: msg.senderRole,
        messageType: msg.messageType,
        content: msg.content || '',
        mediaUrl: msg.mediaUrl,
        isRead: msg.isRead,
        deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
        readAt: msg.readAt ? new Date(msg.readAt) : undefined,
        reactions: msg.reactions || [],
        createdAt: new Date(msg.createdAt || Date.now()),
        updatedAt: new Date(msg.updatedAt || Date.now()),
      }));

      setMessages(mappedMessages);
      setPagination({
        currentPage: response.page || response.currentPage || page,
        totalPages: Math.ceil((response.total || response.totalMessages || 0) / limit),
        totalMessages: response.total || response.totalMessages || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to search messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const handleSocketEvent = useCallback((event: string, data: any) => {
    console.log(`Handling socket event: ${event}`, data);
    if (data.chatId !== chatId) return;

    switch (event) {
      case 'new-message':
      case 'message-updated':
      case 'reaction-added':
      case 'reaction-removed':
        const updatedMessage = transformSocketMessage(data.message);
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m._id));
          let newList = prev.map(msg =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          );
          if (event === 'new-message' && !existingIds.has(updatedMessage._id)) {
            newList = [...newList, updatedMessage];
          }
          return sortMessages(newList);
        });
        if (event === 'new-message') {
          lastMessageTimestamp.current = updatedMessage.createdAt.toISOString();
        }
        break;

      case 'message-deleted':
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
        break;

      case 'message-delivered':
        setMessages(prev => sortMessages(prev.map(msg =>
          msg._id === data.messageId ? {
            ...msg,
            deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : new Date()
          } : msg
        )));
        break;

      case 'message-read':
        setMessages(prev => sortMessages(prev.map(msg =>
          msg._id === data.messageId ? {
            ...msg,
            isRead: true,
            readAt: data.readAt ? new Date(data.readAt) : new Date()
          } : msg
        )));
        break;
    }
  }, [chatId, transformSocketMessage]);

  useEffect(() => {
    if (!chatId || !userId || !currentRole) return;

    const events = [
      'new-message',
      'message-updated',
      'message-deleted',
      'message-delivered',
      'message-read',
      'reaction-added',
      'reaction-removed'
    ];

    events.forEach(event => addEventListener(event, (data: any) => handleSocketEvent(event, data)));

    if (isSocketConnected()) {
      console.log(`Joining chat ${chatId} on mount`);
      joinChat(chatId, userId, currentRole);
    }

    return () => {
      console.log(`Cleaning up listeners for chat ${chatId}`);
      events.forEach(event => removeEventListener(event, (data: any) => handleSocketEvent(event, data)));
      if (isSocketConnected()) {
        leaveChat(chatId, userId);
      }
    };
  }, [chatId, userId, currentRole, handleSocketEvent]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setError('No chat ID provided');
      return;
    }

    fetchMessages();
  }, [chatId, fetchMessages]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log('Socket (re)connected - fetching any missed messages');
      if (chatId && lastMessageTimestamp.current) {
        fetchNewMessages();
      }
      if (chatId && userId && currentRole) {
        console.log(`Rejoining chat ${chatId} after reconnect`);
        joinChat(chatId, userId, currentRole);
      }
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [chatId, fetchNewMessages, userId, currentRole]);

  return {
    messages,
    loading,
    sending,
    error,
    pagination,
    fetchMessages,
    sendMessage,
    addReaction,
    removeReaction,
    markMessagesAsRead,
    deleteMessage,
    searchMessages,
    fetchNewMessages,
  };
};