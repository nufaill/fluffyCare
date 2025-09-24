import { Types } from 'mongoose';
import { IMessageRepository } from '../../interfaces/repositoryInterfaces/IMessageRepository';
import { IDtoMapper } from '../../dto/dto.mapper';
import { IMessageService } from '../../interfaces/serviceInterfaces/IMessageService';
import {
  CreateMessageDTO,
  UpdateMessageDTO,
  MessageResponseDTO,
  MessageListResponseDTO,
  AddReactionDTO,
  RemoveReactionDTO,
  MessageSearchDTO,
  MarkMessagesAsReadDTO,
  MessageStatsResponseDTO,
  UnreadCountDTO,
  MessagesByTypeDTO,
} from '../../dto/message.dto';

export class MessageService implements IMessageService {
  private readonly _messageRepository: IMessageRepository;
  private readonly _dtoMapper: IDtoMapper;

  constructor(messageRepository: IMessageRepository, dtoMapper: IDtoMapper) {
    this._messageRepository = messageRepository;
    this._dtoMapper = dtoMapper;
  }

  async createMessage(dto: CreateMessageDTO): Promise<MessageResponseDTO> {
    try {
      this.validateCreateMessageDto(dto);
      const messageEntity = this._dtoMapper.toCreateMessageEntity(dto);
      const createdMessage = await this._messageRepository.createMessage(messageEntity);
      return this._dtoMapper.toMessageResponseDto(createdMessage);
    } catch (error) {
      throw new Error(`Failed to create message: ${error}`);
    }
  }

  async findMessageById(messageId: string): Promise<MessageResponseDTO | null> {
    try {
      this.validateObjectId(messageId, 'Message ID');
      const message = await this._messageRepository.findMessageById(messageId);
      return message ? this._dtoMapper.toMessageResponseDto(message) : null;
    } catch (error) {
      throw new Error(`Failed to find message by ID: ${error}`);
    }
  }

  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<MessageListResponseDTO> {
    try {
      this.validateObjectId(chatId, 'Chat ID');

      // Fix pagination edge case
      const safePage = Math.max(1, page);
      this.validatePaginationParams(safePage, limit);

      const result = await this._messageRepository.getChatMessages(chatId, safePage, limit);

      if (!result || !Array.isArray(result.messages)) {
        console.warn(`MessageService: Invalid result structure for chat ${chatId}`, result);
        return this._dtoMapper.toMessageListResponseDto([], 0, false, safePage, limit);
      }

      const validMessages = this.filterValidMessages(result.messages);

      if (result.messages.length !== validMessages.length) {
        console.warn(`MessageService: Found ${result.messages.length - validMessages.length} null/invalid messages in chat ${chatId}`);
      }

      // Critical check for data inconsistency
      if (validMessages.length === 0 && result.total > 0) {
        console.error(`MessageService: CRITICAL DATA INCONSISTENCY for chat ${chatId}`);
        console.error(`- Expected messages: ${result.total}`);
        console.error(`- Retrieved messages: ${result.messages.length}`);
        console.error(`- Valid messages: ${validMessages.length}`);
        console.error(`- Page: ${safePage}, Limit: ${limit}`);

        // If this is the first page and we have a total but no messages, 
        // there's likely a pagination bug in the repository
        if (safePage === 1) {
          console.error(`MessageService: Attempting to fetch with page=0 as fallback`);
          try {
            const fallbackResult = await this._messageRepository.getChatMessages(chatId, 0, limit);
            if (fallbackResult && fallbackResult.messages && fallbackResult.messages.length > 0) {
              console.log(`MessageService: Fallback successful - found ${fallbackResult.messages.length} messages with page=0`);
              const fallbackValidMessages = this.filterValidMessages(fallbackResult.messages);
              return this._dtoMapper.toMessageListResponseDto(
                fallbackValidMessages,
                fallbackResult.total || fallbackValidMessages.length,
                fallbackResult.hasMore || false,
                1, // Return page as 1 for frontend consistency
                limit,
              );
            }
          } catch (fallbackError) {
            console.error(`MessageService: Fallback failed:`, fallbackError);
          }
        }
      }

      return this._dtoMapper.toMessageListResponseDto(
        validMessages,
        result.total || validMessages.length,
        result.hasMore || false,
        safePage,
        limit,
      );
    } catch (error) {
      console.error(`MessageService.getChatMessages: Error for chat ${chatId}:`, error);
      throw new Error(`Failed to get chat messages: ${error}`);
    }
  }

  async getLatestMessage(chatId: string): Promise<MessageResponseDTO | null> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      const message = await this._messageRepository.getLatestMessage(chatId);

      if (!message) {
        return null;
      }

      if (!this.isValidMessage(message)) {
        console.warn(`Invalid latest message structure for chat ${chatId}`);
        return null;
      }

      return this._dtoMapper.toMessageResponseDto(message);
    } catch (error) {
      throw new Error(`Failed to get latest message: ${error}`);
    }
  }

  async markAsDelivered(messageId: string, deliveredAt: Date = new Date()): Promise<MessageResponseDTO | null> {
    try {
      this.validateObjectId(messageId, 'Message ID');
      const message = await this._messageRepository.markAsDelivered(messageId, deliveredAt);
      return message ? this._dtoMapper.toMessageResponseDto(message) : null;
    } catch (error) {
      throw new Error(`Failed to mark message as delivered: ${error}`);
    }
  }

  async markAsRead(messageId: string, readAt: Date = new Date()): Promise<MessageResponseDTO | null> {
    try {
      this.validateObjectId(messageId, 'Message ID');
      const message = await this._messageRepository.markAsRead(messageId, readAt);
      return message ? this._dtoMapper.toMessageResponseDto(message) : null;
    } catch (error) {
      throw new Error(`Failed to mark message as read: ${error}`);
    }
  }

  async markMultipleAsRead(messageIds: string[], readAt: Date = new Date()): Promise<number> {
    try {
      this.validateMessageIds(messageIds);
      return await this._messageRepository.markMultipleAsRead(messageIds, readAt);
    } catch (error) {
      throw new Error(`Failed to mark multiple messages as read: ${error}`);
    }
  }

  async markChatMessagesAsRead(dto: MarkMessagesAsReadDTO, readAt: Date = new Date()): Promise<number> {
    try {
      this.validateMarkMessagesAsReadDto(dto);
      return await this._messageRepository.markChatMessagesAsRead(dto, readAt);
    } catch (error) {
      throw new Error(`Failed to mark chat messages as read: ${error}`);
    }
  }

  async addReaction(dto: AddReactionDTO): Promise<MessageResponseDTO | null> {
    try {
      this.validateAddReactionDto(dto);
      const message = await this._messageRepository.addReaction(dto);
      return message ? this._dtoMapper.toMessageResponseDto(message) : null;
    } catch (error) {
      throw new Error(`Failed to add reaction: ${error}`);
    }
  }

  async removeReaction(dto: RemoveReactionDTO): Promise<MessageResponseDTO | null> {
    try {
      this.validateRemoveReactionDto(dto);
      const message = await this._messageRepository.removeReaction(dto.messageId, dto.userId);
      return message ? this._dtoMapper.toMessageResponseDto(message) : null;
    } catch (error) {
      throw new Error(`Failed to remove reaction: ${error}`);
    }
  }

  async searchMessages(dto: MessageSearchDTO): Promise<MessageListResponseDTO> {
    try {
      this.validateMessageSearchDto(dto);
      const result = await this._messageRepository.searchMessages(
        dto.chatId,
        dto.query,
        dto.messageType,
        dto.page || 1,
        dto.limit || 20,
      );

      const validMessages = this.filterValidMessages(result.messages);

      return this._dtoMapper.toMessageListResponseDto(
        validMessages,
        validMessages.length,
        result.hasMore,
        dto.page || 1,
        dto.limit || 20,
      );
    } catch (error) {
      throw new Error(`Failed to search messages: ${error}`);
    }
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      this.validateObjectId(messageId, 'Message ID');
      return await this._messageRepository.deleteMessage(messageId);
    } catch (error) {
      throw new Error(`Failed to delete message: ${error}`);
    }
  }

  async deleteChatMessages(chatId: string): Promise<number> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      return await this._messageRepository.deleteChatMessages(chatId);
    } catch (error) {
      throw new Error(`Failed to delete chat messages: ${error}`);
    }
  }

  async getMessagesByType(dto: MessagesByTypeDTO): Promise<MessageListResponseDTO> {
    try {
      this.validateMessagesByTypeDto(dto);
      const result = await this._messageRepository.getMessagesByType(
        dto.chatId,
        dto.messageType,
        dto.page || 1,
        dto.limit || 20,
      );

      const validMessages = this.filterValidMessages(result.messages);

      return this._dtoMapper.toMessageListResponseDto(
        validMessages,
        validMessages.length,
        result.hasMore,
        dto.page || 1,
        dto.limit || 20,
      );
    } catch (error) {
      throw new Error(`Failed to get messages by type: ${error}`);
    }
  }

  async getChatMessageStats(chatId: string): Promise<MessageStatsResponseDTO> {
    try {
      this.validateObjectId(chatId, 'Chat ID');
      const stats = await this._messageRepository.getChatMessageStats(chatId);
      return this._dtoMapper.toMessageStatsResponseDto(stats);
    } catch (error) {
      throw new Error(`Failed to get chat message stats: ${error}`);
    }
  }

  private isValidMessage(message: any): boolean {
    if (!message) {
      return false;
    }

    if (!message._id) {
      console.warn('Message missing _id:', message);
      return false;
    }

    if (!message.chatId) {
      console.warn('Message missing chatId:', message);
      return false;
    }

    if (!message.senderRole || !['User', 'Shop'].includes(message.senderRole)) {
      console.warn('Message missing or invalid senderRole:', message);
      return false;
    }

    if (!message.messageType || !['Text', 'Image', 'Video', 'Audio', 'File'].includes(message.messageType)) {
      console.warn('Message missing or invalid messageType:', message);
      return false;
    }

    return true;
  }
  async getUnreadCount(dto: UnreadCountDTO): Promise<number> {
    try {
      this.validateUnreadCountDto(dto);
      return await this._messageRepository.getUnreadCount(dto.chatId, dto.receiverRole);
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error}`);
    }
  }

  private filterValidMessages(messages: any[]): any[] {
    if (!Array.isArray(messages)) {
      console.warn('Messages is not an array:', messages);
      return [];
    }

    return messages.filter((message) => {
      if (!message) {
        console.warn('Filtered out null/undefined message');
        return false;
      }

      return this.isValidMessage(message);
    });
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

  private validateCreateMessageDto(dto: CreateMessageDTO): void {
    this.validateObjectId(dto.chatId, 'Chat ID');
    if (!['User', 'Shop'].includes(dto.senderRole)) {
      throw new Error('Invalid sender role');
    }
    if (dto.messageType && !this.isValidMessageType(dto.messageType)) {
      throw new Error('Invalid message type');
    }
    if (dto.messageType !== 'Text' && (!dto.mediaUrl || dto.mediaUrl.trim().length === 0)) {
      throw new Error('Media URL is required for non-text messages');
    }
  }

  private validateMessageIds(messageIds: string[]): void {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new Error('Message IDs array cannot be empty');
    }
    messageIds.forEach((id, index) => {
      this.validateObjectId(id, `Message ID at index ${index}`);
    });
  }

  private validateMarkMessagesAsReadDto(dto: MarkMessagesAsReadDTO): void {
    this.validateObjectId(dto.chatId, 'Chat ID');
    if (!['User', 'Shop'].includes(dto.receiverRole)) {
      throw new Error('Invalid receiver role');
    }
    if (dto.messageIds && dto.messageIds.length > 0) {
      this.validateMessageIds(dto.messageIds);
    }
  }

  private validateUnreadCountDto(dto: UnreadCountDTO): void {
    this.validateObjectId(dto.chatId, 'Chat ID');
    if (!['User', 'Shop'].includes(dto.receiverRole)) {
      throw new Error('Invalid receiver role');
    }
  }

  private validateAddReactionDto(dto: AddReactionDTO): void {
    this.validateObjectId(dto.messageId, 'Message ID');
    this.validateObjectId(dto.userId, 'User ID');
    if (!dto.emoji || dto.emoji.trim().length === 0) {
      throw new Error('Emoji is required');
    }
    if (dto.emoji.length > 10) {
      throw new Error('Emoji cannot exceed 10 characters');
    }
  }

  private validateRemoveReactionDto(dto: RemoveReactionDTO): void {
    this.validateObjectId(dto.messageId, 'Message ID');
    this.validateObjectId(dto.userId, 'User ID');
  }

  private validateMessageSearchDto(dto: MessageSearchDTO): void {
    this.validateObjectId(dto.chatId, 'Chat ID');
    if (!dto.query || dto.query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    if (dto.messageType && !this.isValidMessageType(dto.messageType)) {
      throw new Error('Invalid message type');
    }
  }

  private validateMessagesByTypeDto(dto: MessagesByTypeDTO): void {
    this.validateObjectId(dto.chatId, 'Chat ID');
    if (!this.isValidMessageType(dto.messageType)) {
      throw new Error('Invalid message type');
    }
  }

  private isValidMessageType(type: string): boolean {
    return ['Text', 'Image', 'Video', 'Audio', 'File'].includes(type);
  }
}