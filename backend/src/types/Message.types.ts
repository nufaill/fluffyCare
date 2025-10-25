import { Document, Types } from "mongoose";

export interface Reaction {
  userId: Types.ObjectId | string; 
  emoji: string;
  reactedAt: Date;
}

export interface Message {
  chatId: Types.ObjectId | string; 
  senderRole: "User" | "Shop";
  messageType: "Text" | "Image" | "Video" | "Audio" | "File";
  content: string;
  mediaUrl: string;
  isRead: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  reactions: Reaction[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageDocument extends Message, Document {
  modelName?: string;
}