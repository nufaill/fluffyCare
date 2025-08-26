export interface MessageReaction {
  userId: string;
  emoji: string;
  reactedAt: Date;
}

export interface MessageChat {
  id?: string;
  _id?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
    phone: string;
  };
  shop?: {
    id: string;
    name: string;
    email: string;
    logo?: string;
    phone: string;
    city: string;
  };
}

export interface Message {
  _id?: string;
  id?: string; // For compatibility
  chatId: string | { _id: string; id: string };
  senderRole: 'User' | 'Shop';
  messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  reactions: MessageReaction[];
  createdAt: Date;
  updatedAt: Date;
  chat?: MessageChat;
  
  // Response wrapper properties (for API compatibility)
  success?: boolean;
  data?: any;
  message?: string;
}

// API Response types
export interface MessageResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface MessageListResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    totalPages: number;
    currentPage: number;
    totalMessages: number;
    hasMore?: boolean;
    page?: number;
    total?: number;
  };
  // Direct properties for backward compatibility
  messages?: Message[];
  totalPages?: number;
  currentPage?: number;
  totalMessages?: number;
}

// Socket event types
export interface SocketMessageEvent {
  chatId: string;
  message: Message;
  senderId: string;
  receiverId?: string;
  timestamp: string;
}

export interface SocketTypingEvent {
  chatId: string;
  userId: string;
  userRole: 'User' | 'Shop';
  typing: boolean;
}

export interface SocketReactionEvent {
  chatId: string;
  messageId: string;
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
  message?: Message;
}

export interface SocketMessageStatusEvent {
  chatId: string;
  messageId: string;
  status: 'delivered' | 'read';
  timestamp: string;
  userId: string;
  deliveredAt?: string;
  readAt?: string;
}