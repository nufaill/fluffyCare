export interface Chat {
  chat: boolean;
  id?: any;
  _id?: string;
  userId: string;
  shopId: string;
  lastMessage: string;
  lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File";
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  shop: { id: string; name: string; logo?: string; phone?:Number } | null;
  user: { id: string; fullName: string; profileImage?: string; phone?:Number} | null;
}

export interface ChatDocument extends Chat, Document {}

export interface NewMessageEvent {
  chatId: string;
  messageId: string;
  senderId: string;
  senderRole: 'User' | 'Shop';
  receiverId: string;
  messageType: "Text" | "Image" | "Video" | "Audio" | "File";
  content: string;
  mediaUrl?: string;
  timestamp: string;
}

export interface MessageStatusEvent {
  messageId: string;
  chatId: string;
  status: 'delivered' | 'read';
  timestamp: string;
  userId: string;
}

export interface ChatUpdateEvent {
  chatId: string;
  type: 'chat-created' | 'unread-count-incremented' | 'unread-count-reset' | 'chat-deleted' | 'chat-messages-deleted';
  chat?: Chat;
  unreadCount?: number;
  deletedCount?: number;
}