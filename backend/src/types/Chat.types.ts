import { Document, Types } from "mongoose";

export interface Chat {
  userId: Types.ObjectId;
  shopId: Types.ObjectId;
  lastMessage: string;
  lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File";
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatDocument extends Chat, Document {}
