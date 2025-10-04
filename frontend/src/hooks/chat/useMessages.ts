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

export const useMessages = ({
  chatId,
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
  const processedMessageIds = useRef<Set<string>>(new Set());
  const eventQueue = useRef<Map<string, Message>>(new Map());

  const transformSocketMessage = useCallback((socketMessage: any): Message | null => {
    const msg = socketMessage || {};
    const rawId = msg._id || msg.messageId || msg.id;

    if (!rawId || typeof rawId !== 'string' || rawId.includes('[object Object]')) {
      console.error('Invalid or missing message ID:', { rawId });
      return null;
    }

    return {
      _id: rawId,
      chatId: typeof msg.chatId === 'object'
        ? (msg.chatId._id || msg.chatId.id || msg.chatId || '')
        : (msg.chatId || ''),
      senderRole: msg.senderRole || 'Unknown',
      messageType: msg.messageType || 'Text',
      content: msg.content || '',
      mediaUrl: msg.mediaUrl,
      isRead: msg.isRead ?? false,
      deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
      readAt: msg.readAt ? new Date(msg.readAt) : undefined,
      reactions: msg.reactions || [],
      createdAt: new Date(msg.createdAt || msg.timestamp || Date.now()),
      updatedAt: new Date(msg.updatedAt || msg.timestamp || Date.now()),
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
        description: err.message || 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, toast]);

  const sendMessage = useCallback(async (
    senderRole: 'User' | 'Shop',
    messageType: Message['messageType'] = 'Text',
    content: string,
    mediaUrl?: string
  ) => {
    if (!chatId || !userId || !currentRole) return null;

    setSending(true);
    setError(null);

    try {
      const message = await messageService.createMessage(chatId, senderRole, messageType, content, mediaUrl);
      
      setMessages(prev => sortMessages([...prev, message]));
      lastMessageTimestamp.current = message.createdAt.toISOString();
      return message;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      toast({
        title: 'Error',
        description: err.message || 'Failed to send message',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSending(false);
    }
  }, [chatId, userId, currentRole, toast]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!userId) return;

    try {
      const updatedMessage = await messageService.addReaction(messageId, userId, emoji);
      setMessages(prev => sortMessages(prev.map(msg =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )));
    } catch (err: any) {
      setError(err.message || 'Failed to add reaction');
      toast({
        title: 'Error',
        description: err.message || 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  }, [userId, toast]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!userId) return;

    try {
      const updatedMessage = await messageService.removeReaction(messageId, userId, emoji);
      setMessages(prev => sortMessages(prev.map(msg =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )));
    } catch (err: any) {
      setError(err.message || 'Failed to remove reaction');
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  }, [userId, toast]);

  const markMessagesAsRead = useCallback(async (messageIds: string[], receiverRole: 'User' | 'Shop') => {
    if (!chatId || !messageIds.length) return;

    try {
      const uniqueMessageIds = [...new Set(messageIds)];
      await messageService.markMultipleAsRead(uniqueMessageIds, receiverRole, new Date());
      setMessages(prev => sortMessages(prev.map(msg =>
        messageIds.includes(msg._id || '') ? { ...msg, isRead: true, readAt: new Date() } : msg
      )));
    } catch (err: any) {
      setError(err.message || 'Failed to mark messages as read');
      toast({
        title: 'Error',
        description: err.message || 'Failed to mark messages as read',
        variant: 'destructive',
      });
    }
  }, [chatId, toast]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete message',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchNewMessages = useCallback(async () => {
    if (!chatId || !lastMessageTimestamp.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getChatMessages(
        chatId,
        1,
        50,
        new Date(lastMessageTimestamp.current)
      );

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
        const uniqueNew = mappedMessages.filter(m => !existingIds.has(m._id));
        const newList = [...prev, ...uniqueNew];
        return sortMessages(newList);
      });

      if (mappedMessages.length > 0) {
        lastMessageTimestamp.current = mappedMessages[mappedMessages.length - 1].createdAt.toISOString();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch new messages');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch new messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, toast]);

  const searchMessages = useCallback(async (
    query: string,
    messageType?: Message['messageType']
  ) => {
    if (!chatId || !query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.searchMessages(chatId, query, messageType);
      
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

      setMessages(sortMessages(mappedMessages));
      setPagination({
        currentPage: response.page || response.currentPage || 1,
        totalPages: Math.ceil((response.total || response.totalMessages || 0) / 20), // Use default limit 20
        totalMessages: response.total || response.totalMessages || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to search messages');
      toast({
        title: 'Error',
        description: err.message || 'Failed to search messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, toast]);

  const handleSocketEvent = useCallback((event: string, data: any) => {
    let receivedChatId: string | undefined;
    if (data.chatId) {
      receivedChatId = typeof data.chatId === 'string'
        ? data.chatId
        : (data.chatId._id?.toString() || data.chatId.id?.toString());
    } else if (data.message?.chatId) {
      receivedChatId = typeof data.message.chatId === 'string'
        ? data.message.chatId
        : (data.message.chatId._id?.toString() || data.message.chatId.id?.toString());
    } else {
      console.warn(`[Socket Event] No chatId found in data for ${event}. Assuming current chat.`);
      receivedChatId = chatId;
    }

    if (receivedChatId !== chatId) {
      console.warn(`[Socket Event] Ignored ${event} for chatId ${receivedChatId}, expected ${chatId}`);
      return;
    }

    switch (event) {
      case 'new-message':
      case 'message-updated':
      case 'reaction-added':
      case 'reaction-removed':
        const socketMsg = data.message || data;
        const updatedMessage = transformSocketMessage(socketMsg);
        if (!updatedMessage || !updatedMessage._id) {
          console.warn('Invalid message received, skipping:', socketMsg);
          return;
        }
        if (!processedMessageIds.current.has(updatedMessage._id)) {
          eventQueue.current.set(updatedMessage._id, updatedMessage);
          setMessages(prev => {
            const newList = [...prev];
            eventQueue.current.forEach((msg, id) => {
              const existingIndex = newList.findIndex(m => m._id === id);
              if (existingIndex >= 0) {
                newList[existingIndex] = msg;
              } else {
                newList.push(msg);
                processedMessageIds.current.add(id);
              }
            });
            eventQueue.current.clear();
            return sortMessages(newList);
          });
          if (event === 'new-message') {
            lastMessageTimestamp.current = updatedMessage.createdAt.toISOString();
          }
        }
        break;

      case 'message-deleted':
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
        processedMessageIds.current.delete(data.messageId);
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

    const listeners = new Map<string, (data: any) => void>();

    events.forEach(event => {
      const listener = (data: any) => handleSocketEvent(event, data);
      listeners.set(event, listener);
      addEventListener(event, listener);
    });

    if (isSocketConnected()) {
      joinChat(chatId, userId, currentRole);
    }

    return () => {
      events.forEach(event => {
        const listener = listeners.get(event);
        if (listener) {
          removeEventListener(event, listener);
        }
      });
      if (isSocketConnected()) {
        leaveChat(chatId, userId);
      }
      processedMessageIds.current.clear();
      eventQueue.current.clear();
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
      if (chatId && lastMessageTimestamp.current) {
        fetchNewMessages();
      }
      if (chatId && userId && currentRole) {
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