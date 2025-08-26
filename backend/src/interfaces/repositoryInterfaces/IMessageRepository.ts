import { Types } from 'mongoose';
import { Message, MessageDocument } from '../../types/Message.types';

export interface IMessageRepository {
    getUnreadCount(chatId: string, receiverRole: string): number | PromiseLike<number>;
    createMessage(messageData: Partial<Message>): Promise<MessageDocument>;
    findMessageById(messageId: Types.ObjectId | string): Promise<MessageDocument | null>;
    getChatMessages(
        chatId: Types.ObjectId | string,
        page: number,
        limit: number,
    ): Promise<{ messages: MessageDocument[]; total: number; hasMore: boolean }>;
    getLatestMessage(chatId: Types.ObjectId | string): Promise<MessageDocument | null>;
    markAsDelivered(
        messageId: Types.ObjectId | string,
        deliveredAt: Date,
    ): Promise<MessageDocument | null>;
    markAsRead(messageId: Types.ObjectId | string, readAt: Date): Promise<MessageDocument | null>;
    markMultipleAsRead(messageIds: string[], readAt: Date): Promise<number>;
    markChatMessagesAsRead(
        dto: { chatId: string; receiverRole: "User" | "Shop"; messageIds?: string[] },
        readAt?: Date
    ): Promise<number>;
    addReaction(
        dto: { messageId: string; userId: string; emoji: string }
    ): Promise<MessageDocument | null>;
    removeReaction(
        messageId: Types.ObjectId | string,
        userId: Types.ObjectId | string,
    ): Promise<MessageDocument | null>;
    searchMessages(
        chatId: Types.ObjectId | string,
        query: string,
        messageType?: 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
        page?: number,
        limit?: number,
    ): Promise<{ messages: MessageDocument[]; total: number; hasMore: boolean }>;
    deleteMessage(messageId: Types.ObjectId | string): Promise<boolean>;
    deleteChatMessages(chatId: Types.ObjectId | string): Promise<number>;
    getMessagesByType(
        chatId: Types.ObjectId | string,
        messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
        page: number,
        limit: number,
    ): Promise<{ messages: MessageDocument[]; total: number; hasMore: boolean }>;
    getChatMessageStats(chatId: Types.ObjectId | string): Promise<{
        totalMessages: number;
        textMessages: number;
        mediaMessages: number;
        unreadMessages: number;
        totalReactions: number;
    }>;
}