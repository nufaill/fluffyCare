import { Types } from "mongoose";
import { Chat, ChatDocument } from "../../types/Chat.types";

export interface IChatRepository {
    createChat(chatData: Partial<Chat>): Promise<ChatDocument>;
    findChatByUserAndShop(userId: Types.ObjectId | string, shopId: Types.ObjectId | string): Promise<ChatDocument | null>;
    findChatById(chatId: Types.ObjectId | string): Promise<ChatDocument | null>;
    getUserChats(userId: Types.ObjectId | string, page?: number, limit?: number): Promise<{ chats: ChatDocument[]; total: number; hasMore: boolean; }>;
    getShopChats(shopId: Types.ObjectId | string, page?: number, limit?: number): Promise<{ chats: ChatDocument[]; total: number; hasMore: boolean; }>;
    updateLastMessage(chatId: Types.ObjectId | string, updateData: { lastMessage: string; lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File"; lastMessageAt: Date; }): Promise<ChatDocument | null>;
    incrementUnreadCount(chatId: Types.ObjectId | string): Promise<ChatDocument | null>;
    resetUnreadCount(chatId: Types.ObjectId | string): Promise<ChatDocument | null>;
    deleteChat(chatId: Types.ObjectId | string): Promise<boolean>;
    getOrCreateChat(userId: Types.ObjectId | string, shopId: Types.ObjectId | string): Promise<ChatDocument>;
    searchChats(searcherId: Types.ObjectId | string, searcherRole: "User" | "Shop", query: string, page?: number, limit?: number): Promise<{ chats: ChatDocument[]; total: number; hasMore: boolean; }>;
    getTotalUnreadCount(userId: Types.ObjectId | string, role: "User" | "Shop"): Promise<number>;
}