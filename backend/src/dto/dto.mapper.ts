import { Types } from 'mongoose';
import { ChatDocument } from '../types/Chat.types';
import { MessageDocument } from '../types/Message.types';
import {
  ChatResponseDTO,
  ChatListResponseDTO,
  CreateChatDTO,
  UnreadCountResponseDTO,
} from './chat.dto';
import {
  MessageResponseDTO,
  MessageListResponseDTO,
  ReactionDTO,
  MessageStatsResponseDTO,
  CreateMessageDTO,
} from './message.dto';
import { Chat } from '../types/Chat.types';
import { Message } from '../types/Message.types';

export interface IDtoMapper {
  // Chat mapping methods
  toCreateChatEntity(dto: CreateChatDTO): Partial<Chat>;
  toChatResponseDto(entity: ChatDocument): ChatResponseDTO;
  toChatListResponseDto(
    chats: ChatDocument[],
    total: number,
    hasMore: boolean,
    page: number,
    limit: number,
  ): ChatListResponseDTO;
  toUnreadCountResponseDto(count: number, role: 'User' | 'Shop'): UnreadCountResponseDTO;

  // Message mapping methods
  toCreateMessageEntity(dto: CreateMessageDTO): Partial<Message>;
  toMessageResponseDto(entity: MessageDocument): MessageResponseDTO;
  toMessageListResponseDto(
    messages: MessageDocument[],
    total: number,
    hasMore: boolean,
    page: number,
    limit: number,
  ): MessageListResponseDTO;
  toReactionDto(reaction: any): ReactionDTO;
  toMessageStatsResponseDto(stats: any): MessageStatsResponseDTO;
}

export class DtoMapper implements IDtoMapper {
  // Chat mapping methods
  toCreateChatEntity(dto: CreateChatDTO): Partial<Chat> {
    return {
      userId: new Types.ObjectId(dto.userId),
      shopId: new Types.ObjectId(dto.shopId),
      lastMessage: '',
      lastMessageType: 'Text',
      lastMessageAt: null,
      unreadCount: 0,
    };
  }

  toChatResponseDto(entity: ChatDocument): ChatResponseDTO {
    const populatedEntity = entity as any;

    return {
      id: entity._id?.toString() || '',
      userId: populatedEntity.userId && typeof populatedEntity.userId === 'object'
        ? populatedEntity.userId._id?.toString() || ''
        : entity.userId?.toString() || '',
      shopId: populatedEntity.shopId && typeof populatedEntity.shopId === 'object'
        ? populatedEntity.shopId._id?.toString() || ''
        : entity.shopId?.toString() || '',
      lastMessage: entity.lastMessage || '',
      lastMessageType: entity.lastMessageType || 'Text',
      lastMessageAt: entity.lastMessageAt || null,
      unreadCount: entity.unreadCount || 0,
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      user: populatedEntity.userId && typeof populatedEntity.userId === 'object' ? {
        id: populatedEntity.userId._id?.toString() || '',
        fullName: populatedEntity.userId.fullName || '',
        email: populatedEntity.userId.email || '',
        profileImage: populatedEntity.userId.profileImage || undefined,
        phone: populatedEntity.userId.phone || undefined,
      } : undefined,
      shop: populatedEntity.shopId && typeof populatedEntity.shopId === 'object' ? {
        id: populatedEntity.shopId._id?.toString() || '',
        name: populatedEntity.shopId.name || '',
        email: populatedEntity.shopId.email || '',
        logo: populatedEntity.shopId.logo || undefined,
        phone: populatedEntity.shopId.phone || undefined,
        city: populatedEntity.shopId.city || undefined,
      } : undefined,
      toJSON() {
        return {
          id: this.id,
          userId: this.userId,
          shopId: this.shopId,
          lastMessage: this.lastMessage,
          lastMessageType: this.lastMessageType,
          lastMessageAt: this.lastMessageAt,
          unreadCount: this.unreadCount,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
          user: this.user,
          shop: this.shop,
        };
      },
    };
  }

  toChatListResponseDto(
    chats: ChatDocument[],
    total: number,
    hasMore: boolean,
    page: number,
    limit: number,
  ): ChatListResponseDTO {
    return {
      chats: chats.map(chat => this.toChatResponseDto(chat)),
      total,
      hasMore,
      page,
      limit,
    };
  }

  toUnreadCountResponseDto(count: number, role: 'User' | 'Shop'): UnreadCountResponseDTO {
    return {
      totalUnreadCount: count,
      role,
    };
  }

  // Message mapping methods
  toCreateMessageEntity(dto: CreateMessageDTO): Partial<Message> {
    return {
      chatId: new Types.ObjectId(dto.chatId),
      senderRole: dto.senderRole,
      messageType: dto.messageType || 'Text',
      content: dto.content || '',
      mediaUrl: dto.mediaUrl || '',
      isRead: false,
      reactions: [],
    };
  }

  toMessageResponseDto(entity: MessageDocument): MessageResponseDTO {
    const populatedEntity = entity as any;

    return {
      id: entity._id?.toString() || '',
      chatId: populatedEntity.chatId && typeof populatedEntity.chatId === 'object' ? populatedEntity.chatId._id?.toString() || '' : entity.chatId?.toString() || '',
      senderRole: entity.senderRole || 'User',
      messageType: entity.messageType || 'Text',
      content: entity.content || '',
      mediaUrl: entity.mediaUrl || '',
      isRead: entity.isRead || false,
      deliveredAt: entity.deliveredAt || undefined,
      readAt: entity.readAt || undefined,
      reactions: entity.reactions?.map(reaction => this.toReactionDto(reaction)) || [],
      createdAt: entity.createdAt || new Date(),
      updatedAt: entity.updatedAt || new Date(),
      chat: populatedEntity.chatId && typeof populatedEntity.chatId === 'object' ? {
        id: populatedEntity.chatId._id?.toString() || '',
        user: populatedEntity.chatId.userId && typeof populatedEntity.chatId.userId === 'object' ? {
          id: populatedEntity.chatId.userId._id?.toString() || '',
          fullName: populatedEntity.chatId.userId.fullName || '',
          email: populatedEntity.chatId.userId.email || '',
          profileImage: populatedEntity.chatId.userId.profileImage || undefined,
          phone: populatedEntity.chatId.userId.phone || undefined,
        } : undefined,
        shop: populatedEntity.chatId.shopId && typeof populatedEntity.chatId.shopId === 'object' ? {
          id: populatedEntity.chatId.shopId._id?.toString() || '',
          name: populatedEntity.chatId.shopId.name || '',
          email: populatedEntity.chatId.shopId.email || '',
          logo: populatedEntity.chatId.shopId.logo || undefined,
          phone: populatedEntity.chatId.shopId.phone || undefined,
          city: populatedEntity.chatId.shopId.city || undefined,
        } : undefined,
      } : undefined,
    };
  }

  toMessageListResponseDto(
    messages: MessageDocument[],
    total: number,
    hasMore: boolean,
    page: number,
    limit: number,
  ): MessageListResponseDTO {
    return {
      messages: messages.map(message => this.toMessageResponseDto(message)),
      totalMessages: total,
      total,
      hasMore,
      page,
      limit,
    };
  }

  toReactionDto(reaction: any): ReactionDTO {
    return {
      userId: reaction.userId?.toString() || '',
      emoji: reaction.emoji || '',
      reactedAt: reaction.reactedAt || new Date(),
      user: reaction.userId && typeof reaction.userId === 'object' ? {
        id: reaction.userId._id?.toString() || '',
        fullName: reaction.userId.fullName || '',
        profileImage: reaction.userId.profileImage || undefined,
      } : undefined,
    };
  }

  toMessageStatsResponseDto(stats: any): MessageStatsResponseDTO {
    return {
      totalMessages: stats.totalMessages || 0,
      textMessages: stats.textMessages || 0,
      mediaMessages: stats.mediaMessages || 0,
      unreadMessages: stats.unreadMessages || 0,
      totalReactions: stats.totalReactions || 0,
    };
  }
}