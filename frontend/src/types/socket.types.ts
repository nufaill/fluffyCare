// types/socket.types.ts
export interface SocketEvents {
  // Chat events
  'chat-update': (data: ChatUpdatePayload) => void;
  'new-message': (data: NewMessagePayload) => void;
  'message-status': (data: MessageStatusPayload) => void;
  'message-reaction': (data: MessageReactionPayload) => void;
  
  // Connection events
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_attempt': (attemptNumber: number) => void;
  'reconnect_error': (error: Error) => void;
  'reconnect_failed': () => void;
  
  // User events
  'join-chat': (chatId: string) => void;
  'leave-chat': (chatId: string) => void;
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'typing-start': (data: TypingPayload) => void;
  'typing-stop': (data: TypingPayload) => void;
}

export interface ChatUpdatePayload {
  type: 'chat-created' | 'last-message-updated' | 'unread-count-incremented' | 'unread-count-reset' | 'chat-deleted' | 'message-deleted' | 'chat-messages-deleted';
  chat?: any;
  lastMessage?: string;
  lastMessageType?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  messageId?: string;
  deletedCount?: number;
}

export interface NewMessagePayload {
  chatId: string;
  messageId: string;
  senderId: string;
  senderRole: 'User' | 'Shop';
  receiverId: string;
  messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
  content: string;
  mediaUrl?: string;
  timestamp: string;
}

export interface MessageStatusPayload {
  messageId: string;
  chatId: string;
  status: 'delivered' | 'read';
  timestamp: string;
  userId: string;
}

export interface MessageReactionPayload {
  messageId: string;
  chatId: string;
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
  timestamp: string;
}

export interface TypingPayload {
  chatId: string;
  userId: string;
  userRole: 'User' | 'Shop';
  timestamp: string;
}

export interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  isReconnecting: boolean;
  connectionError: string | null;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  startTyping: (chatId: string, userId: string, userRole: 'User' | 'Shop') => void;
  stopTyping: (chatId: string, userId: string, userRole: 'User' | 'Shop') => void;
  emitUserOnline: (userId: string) => void;
  emitUserOffline: (userId: string) => void;
}