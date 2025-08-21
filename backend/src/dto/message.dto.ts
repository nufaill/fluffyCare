import { Types } from "mongoose";

export interface CreateMessageDTO {
  chatId: string;
  senderRole: "User" | "Shop";
  messageType?: "Text" | "Image" | "Video" | "Audio" | "File";
  content?: string;
  mediaUrl?: string;
}

export interface UpdateMessageDTO {
  content?: string;
  mediaUrl?: string;
  isRead?: boolean;
  deliveredAt?: Date;
  readAt?: Date;
}

export interface ReactionDTO {
  userId: string;
  emoji: string;
  reactedAt: Date;
  user?: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
}

export interface MessageResponseDTO {
  id: string;
  chatId: string;
  senderRole: "User" | "Shop";
  messageType: "Text" | "Image" | "Video" | "Audio" | "File";
  content: string;
  mediaUrl: string;
  isRead: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  reactions: ReactionDTO[];
  createdAt: Date;
  updatedAt: Date;
  chat?: {
    id: string;
    user?: {
      id: string;
      fullName: string;
      email: string;
      profileImage?: string;
      phone?: string;
    };
    shop?: {
      id: string;
      name: string;
      email: string;
      logo?: string;
      phone?: string;
      city?: string;
    };
  };
}

export interface MessageListResponseDTO {
  messages: MessageResponseDTO[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface AddReactionDTO {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface RemoveReactionDTO {
  messageId: string;
  userId: string;
}

export interface MessageSearchDTO {
  chatId: string;
  query: string;
  messageType?: "Text" | "Image" | "Video" | "Audio" | "File";
  page?: number;
  limit?: number;
}

export interface MarkMessagesAsReadDTO {
  chatId: string;
  receiverRole: "User" | "Shop";
  messageIds?: string[];
}

export interface MessageStatsResponseDTO {
  totalMessages: number;
  textMessages: number;
  mediaMessages: number;
  unreadMessages: number;
  totalReactions: number;
}

export interface UnreadCountDTO {
  chatId: string;
  receiverRole: "User" | "Shop";
}

export interface MessagesByTypeDTO {
  chatId: string;
  messageType: "Text" | "Image" | "Video" | "Audio" | "File";
  page?: number;
  limit?: number;
}