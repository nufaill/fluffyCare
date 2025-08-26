import { Types } from 'mongoose';
import { IChatRepository } from '../../interfaces/repositoryInterfaces/IChatRepository';
import { IDtoMapper } from '../../dto/dto.mapper';
import { IChatService } from '../../interfaces/serviceInterfaces/IChatService';
import {
  CreateChatDTO,
  UpdateChatDTO,
  ChatResponseDTO,
  ChatListResponseDTO,
  ChatSearchDTO,
  UnreadCountResponseDTO,
} from '../../dto/chat.dto';

export class ChatService implements IChatService {
  private readonly chatRepository: IChatRepository;
  private readonly dtoMapper: IDtoMapper;

  constructor(chatRepository: IChatRepository, dtoMapper: IDtoMapper) {
    this.chatRepository = chatRepository;
    this.dtoMapper = dtoMapper;
  }

  async createChat(dto: CreateChatDTO): Promise<ChatResponseDTO> {
    try {
      const chatEntity = this.dtoMapper.toCreateChatEntity(dto);
      const createdChat = await this.chatRepository.createChat(chatEntity);
      return this.dtoMapper.toChatResponseDto(createdChat);
    } catch (error) {
      throw new Error(`Failed to create chat: ${error}`);
    }
  }

  async findChatByUserAndShop(userId: string, shopId: string): Promise<ChatResponseDTO | null> {
    try {
      const chat = await this.chatRepository.findChatByUserAndShop(userId, shopId);
      return chat ? this.dtoMapper.toChatResponseDto(chat) : null;
    } catch (error) {
      throw new Error(`Failed to find chat by user and shop: ${error}`);
    }
  }

  async findChatById(chatId: string): Promise<ChatResponseDTO | null> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      const chat = await this.chatRepository.findChatById(chatId);
      return chat ? this.dtoMapper.toChatResponseDto(chat) : null;
    } catch (error) {
      throw new Error(`Failed to find chat by ID: ${error}`);
    }
  }

  async getUserChats(userId: string, page: number = 1, limit: number = 20): Promise<ChatListResponseDTO> {
    try {
      this.validateObjectId(userId, 'User ID');
      this.validatePaginationParams(page, limit);

      const result = await this.chatRepository.getUserChats(userId, page, limit);
      return this.dtoMapper.toChatListResponseDto(
        result.chats,
        result.total,
        result.hasMore,
        page,
        limit,
      );
    } catch (error) {
      throw new Error(`Failed to get user chats: ${error}`);
    }
  }

  async getShopChats(shopId: string, page: number = 1, limit: number = 20): Promise<ChatListResponseDTO> {
    try {
      this.validateObjectId(shopId, 'Shop ID');
      this.validatePaginationParams(page, limit);

      const result = await this.chatRepository.getShopChats(shopId, page, limit);
      return this.dtoMapper.toChatListResponseDto(
        result.chats,
        result.total,
        result.hasMore,
        page,
        limit,
      );
    } catch (error) {
      throw new Error(`Failed to get shop chats: ${error}`);
    }
  }

  async updateLastMessage(
    chatId: string,
    updateData: {
      lastMessage: string;
      lastMessageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File';
      lastMessageAt: Date;
    },
  ): Promise<ChatResponseDTO | null> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      this.validateUpdateMessageData(updateData);

      const updatedChat = await this.chatRepository.updateLastMessage(chatId, updateData);
      return updatedChat ? this.dtoMapper.toChatResponseDto(updatedChat) : null;
    } catch (error) {
      throw new Error(`Failed to update last message: ${error}`);
    }
  }

  async incrementUnreadCount(chatId: string): Promise<ChatResponseDTO | null> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      const updatedChat = await this.chatRepository.incrementUnreadCount(chatId);
      return updatedChat ? this.dtoMapper.toChatResponseDto(updatedChat) : null;
    } catch (error) {
      throw new Error(`Failed to increment unread count: ${error}`);
    }
  }

  async resetUnreadCount(chatId: string): Promise<ChatResponseDTO | null> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      const updatedChat = await this.chatRepository.resetUnreadCount(chatId);
      return updatedChat ? this.dtoMapper.toChatResponseDto(updatedChat) : null;
    } catch (error) {
      throw new Error(`Failed to reset unread count: ${error}`);
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      return await this.chatRepository.deleteChat(chatId);
    } catch (error) {
      throw new Error(`Failed to delete chat: ${error}`);
    }
  }

  async getOrCreateChat(userId: string, shopId: string): Promise<ChatResponseDTO> {
    try {
      this.validateObjectId(userId, 'User ID');
      this.validateObjectId(shopId, 'Shop ID');

      const chat = await this.chatRepository.getOrCreateChat(userId, shopId);
      return this.dtoMapper.toChatResponseDto(chat);
    } catch (error) {
      throw new Error(`Failed to get or create chat: ${error}`);
    }
  }

  async searchChats(dto: ChatSearchDTO): Promise<ChatListResponseDTO> {
    try {
      this.validateSearchDto(dto);

      const page = dto.page || 1;
      const limit = dto.limit || 20;
      this.validatePaginationParams(page, limit);

      const result = await this.chatRepository.searchChats(
        dto.query,
        dto.searcherRole,
        dto.query,
        page,
        limit,
      );

      return this.dtoMapper.toChatListResponseDto(
        result.chats,
        result.total,
        result.hasMore,
        page,
        limit,
      );
    } catch (error) {
      throw new Error(`Failed to search chats: ${error}`);
    }
  }

  async getTotalUnreadCount(userId: string, role: 'User' | 'Shop'): Promise<UnreadCountResponseDTO> {
    try {
      this.validateObjectId(userId, 'User ID');
      this.validateRole(role);

      const count = await this.chatRepository.getTotalUnreadCount(userId, role);
      return this.dtoMapper.toUnreadCountResponseDto(count, role);
    } catch (error) {
      throw new Error(`Failed to get total unread count: ${error}`);
    }
  }

  private validateObjectId(id: string, fieldName: string): void {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ${fieldName}: ${id}`);
    }
  }

  private validatePaginationParams(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  private validateUpdateMessageData(data: any): void {
    if (!data.lastMessage || typeof data.lastMessage !== 'string') {
      throw new Error('Last message is required and must be a string');
    }
    const validTypes = ['Text', 'Image', 'Video', 'Audio', 'File'];
    if (!validTypes.includes(data.lastMessageType)) {
      throw new Error('Invalid message type');
    }
    if (!(data.lastMessageAt instanceof Date)) {
      throw new Error('Last message date must be a valid Date object');
    }
  }

  private validateSearchDto(dto: ChatSearchDTO): void {
    if (!dto.query || dto.query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    if (!['User', 'Shop'].includes(dto.searcherRole)) {
      throw new Error('Invalid searcher role');
    }
  }

  private validateRole(role: string): void {
    if (!['User', 'Shop'].includes(role)) {
      throw new Error('Invalid role');
    }
  }
}