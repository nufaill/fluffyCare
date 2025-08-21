import { Types } from "mongoose";

export interface CreateChatDTO {
  userId: string;
  shopId: string;
}

export interface UpdateChatDTO {
  lastMessage?: string;
  lastMessageType?: "Text" | "Image" | "Video" | "Audio" | "File";
  lastMessageAt?: Date;
  unreadCount?: number;
}

export interface ChatResponseDTO {
  id: string;
  userId: string;
  shopId: string;
  lastMessage: string;
  lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File";
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
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
}

export interface ChatListResponseDTO {
  chats: ChatResponseDTO[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface ChatSearchDTO {
  query: string;
  searcherRole: "User" | "Shop";
  page?: number;
  limit?: number;
}

export interface UnreadCountResponseDTO {
  totalUnreadCount: number;
  role: "User" | "Shop";
}