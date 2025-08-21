import { Types } from "mongoose";
import { IMessageRepository } from "../../interfaces/repositoryInterfaces/IMessageRepository";
import { IDtoMapper } from "../../dto/dto.mapper";
import { IMessageService } from "../../interfaces/serviceInterfaces/IMessageService";
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
    MessagesByTypeDTO
} from "../../dto/message.dto";

export class MessageService implements IMessageService {
    private readonly _messageRepository: IMessageRepository;
    private readonly _dtoMapper: IDtoMapper;

    constructor(messageRepository: IMessageRepository, dtoMapper: IDtoMapper) {
        this._messageRepository = messageRepository;
        this._dtoMapper = dtoMapper;
    }

    async createMessage(dto: CreateMessageDTO): Promise<MessageResponseDTO> {
        try {
            this._validateCreateMessageDto(dto);
            const messageEntity = this._dtoMapper.toCreateMessageEntity(dto);
            const createdMessage = await this._messageRepository.createMessage(messageEntity);
            return this._dtoMapper.toMessageResponseDto(createdMessage);
        } catch (error) {
            throw new Error(`Failed to create message: ${error}`);
        }
    }

    async findMessageById(messageId: string): Promise<MessageResponseDTO | null> {
        try {
            this._validateObjectId(messageId, "Message ID");
            const message = await this._messageRepository.findMessageById(messageId);
            return message ? this._dtoMapper.toMessageResponseDto(message) : null;
        } catch (error) {
            throw new Error(`Failed to find message by ID: ${error}`);
        }
    }

    async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<MessageListResponseDTO> {
        try {
            this._validateObjectId(chatId, "Chat ID");
            this._validatePaginationParams(page, limit);

            const result = await this._messageRepository.getChatMessages(chatId, page, limit);
            return this._dtoMapper.toMessageListResponseDto(
                result.messages,
                result.total,
                result.hasMore,
                page,
                limit
            );
        } catch (error) {
            throw new Error(`Failed to get chat messages: ${error}`);
        }
    }

    async getLatestMessage(chatId: string): Promise<MessageResponseDTO | null> {
        try {
            this._validateObjectId(chatId, "Chat ID");
            const message = await this._messageRepository.getLatestMessage(chatId);
            return message ? this._dtoMapper.toMessageResponseDto(message) : null;
        } catch (error) {
            throw new Error(`Failed to get latest message: ${error}`);
        }
    }

    async markAsDelivered(messageId: string, deliveredAt: Date = new Date()): Promise<MessageResponseDTO | null> {
        try {
            this._validateObjectId(messageId, "Message ID");
            const message = await this._messageRepository.markAsDelivered(messageId, deliveredAt);
            return message ? this._dtoMapper.toMessageResponseDto(message) : null;
        } catch (error) {
            throw new Error(`Failed to mark message as delivered: ${error}`);
        }
    }

    async markAsRead(messageId: string, readAt: Date = new Date()): Promise<MessageResponseDTO | null> {
        try {
            this._validateObjectId(messageId, "Message ID");
            const message = await this._messageRepository.markAsRead(messageId, readAt);
            return message ? this._dtoMapper.toMessageResponseDto(message) : null;
        } catch (error) {
            throw new Error(`Failed to mark message as read: ${error}`);
        }
    }

    async markMultipleAsRead(messageIds: string[], readAt: Date = new Date()): Promise<number> {
        try {
            this._validateMessageIds(messageIds);
            return await this._messageRepository.markMultipleAsRead(messageIds, readAt);
        } catch (error) {
            throw new Error(`Failed to mark multiple messages as read: ${error}`);
        }
    }

    async markChatMessagesAsRead(dto: MarkMessagesAsReadDTO, readAt: Date = new Date()): Promise<number> {
        try {
            this._validateMarkMessagesAsReadDto(dto);
            return await this._messageRepository.markChatMessagesAsRead(dto.chatId, dto.receiverRole, readAt);
        } catch (error) {
            throw new Error(`Failed to mark chat messages as read: ${error}`);
        }
    }

    async getUnreadCount(dto: UnreadCountDTO): Promise<number> {
        try {
            this._validateUnreadCountDto(dto);
            return await this._messageRepository.getUnreadCount(dto.chatId, dto.receiverRole);
        } catch (error) {
            throw new Error(`Failed to get unread count: ${error}`);
        }
    }

    async addReaction(dto: AddReactionDTO): Promise<MessageResponseDTO | null> {
        try {
            this._validateAddReactionDto(dto);
            const message = await this._messageRepository.addReaction(dto.messageId, dto.userId, dto.emoji);
            return message ? this._dtoMapper.toMessageResponseDto(message) : null;
        } catch (error) {
            throw new Error(`Failed to add reaction: ${error}`);
        }
    }

    async removeReaction(dto: RemoveReactionDTO): Promise<MessageResponseDTO | null> {
        try {
            this._validateRemoveReactionDto(dto);
            const message = await this._messageRepository.removeReaction(dto.messageId, dto.userId);
            return message ? this._dtoMapper.toMessageResponseDto(message) : null;
        } catch (error) {
            throw new Error(`Failed to remove reaction: ${error}`);
        }
    }

    async searchMessages(dto: MessageSearchDTO): Promise<MessageListResponseDTO> {
        try {
            this._validateMessageSearchDto(dto);

            const page = dto.page || 1;
            const limit = dto.limit || 20;
            this._validatePaginationParams(page, limit);

            const result = await this._messageRepository.searchMessages(
                dto.chatId,
                dto.query,
                dto.messageType,
                page,
                limit
            );

            return this._dtoMapper.toMessageListResponseDto(
                result.messages,
                result.total,
                result.hasMore,
                page,
                limit
            );
        } catch (error) {
            throw new Error(`Failed to search messages: ${error}`);
        }
    }

    async deleteMessage(messageId: string): Promise<boolean> {
        try {
            this._validateObjectId(messageId, "Message ID");
            return await this._messageRepository.deleteMessage(messageId);
        } catch (error) {
            throw new Error(`Failed to delete message: ${error}`);
        }
    }

    async deleteChatMessages(chatId: string): Promise<number> {
        try {
            this._validateObjectId(chatId, "Chat ID");
            return await this._messageRepository.deleteChatMessages(chatId);
        } catch (error) {
            throw new Error(`Failed to delete chat messages: ${error}`);
        }
    }

    async getMessagesByType(dto: MessagesByTypeDTO): Promise<MessageListResponseDTO> {
        try {
            this._validateMessagesByTypeDto(dto);

            const page = dto.page || 1;
            const limit = dto.limit || 20;
            this._validatePaginationParams(page, limit);

            const result = await this._messageRepository.getMessagesByType(
                dto.chatId,
                dto.messageType,
                page,
                limit
            );

            return this._dtoMapper.toMessageListResponseDto(
                result.messages,
                result.total,
                result.hasMore,
                page,
                limit
            );
        } catch (error) {
            throw new Error(`Failed to get messages by type: ${error}`);
        }
    }

    async getChatMessageStats(chatId: string): Promise<MessageStatsResponseDTO> {
        try {
            this._validateObjectId(chatId, "Chat ID");
            const stats = await this._messageRepository.getChatMessageStats(chatId);
            return this._dtoMapper.toMessageStatsResponseDto(stats);
        } catch (error) {
            throw new Error(`Failed to get chat message stats: ${error}`);
        }
    }

    // Private validation methods
    private _validateObjectId(id: string, fieldName: string): void {
        if (!id || !Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid ${fieldName}: ${id}`);
        }
    }

    private _validatePaginationParams(page: number, limit: number): void {
        if (page < 1) {
            throw new Error("Page must be greater than 0");
        }
        if (limit < 1 || limit > 100) {
            throw new Error("Limit must be between 1 and 100");
        }
    }

    private _validateCreateMessageDto(dto: CreateMessageDTO): void {
        this._validateObjectId(dto.chatId, "Chat ID");
        if (!["User", "Shop"].includes(dto.senderRole)) {
            throw new Error("Invalid sender role");
        }
        if (dto.messageType && !this._isValidMessageType(dto.messageType)) {
            throw new Error("Invalid message type");
        }
        if (dto.messageType !== "Text" && (!dto.mediaUrl || dto.mediaUrl.trim().length === 0)) {
            throw new Error("Media URL is required for non-text messages");
        }
    }

    private _validateMessageIds(messageIds: string[]): void {
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            throw new Error("Message IDs array cannot be empty");
        }
        messageIds.forEach((id, index) => {
            this._validateObjectId(id, `Message ID at index ${index}`);
        });
    }

    private _validateMarkMessagesAsReadDto(dto: MarkMessagesAsReadDTO): void {
        this._validateObjectId(dto.chatId, "Chat ID");
        if (!["User", "Shop"].includes(dto.receiverRole)) {
            throw new Error("Invalid receiver role");
        }
        if (dto.messageIds && dto.messageIds.length > 0) {
            this._validateMessageIds(dto.messageIds);
        }
    }

    private _validateUnreadCountDto(dto: UnreadCountDTO): void {
        this._validateObjectId(dto.chatId, "Chat ID");
        if (!["User", "Shop"].includes(dto.receiverRole)) {
            throw new Error("Invalid receiver role");
        }
    }

    private _validateAddReactionDto(dto: AddReactionDTO): void {
        this._validateObjectId(dto.messageId, "Message ID");
        this._validateObjectId(dto.userId, "User ID");
        if (!dto.emoji || dto.emoji.trim().length === 0) {
            throw new Error("Emoji is required");
        }
        if (dto.emoji.length > 10) {
            throw new Error("Emoji cannot exceed 10 characters");
        }
    }

    private _validateRemoveReactionDto(dto: RemoveReactionDTO): void {
        this._validateObjectId(dto.messageId, "Message ID");
        this._validateObjectId(dto.userId, "User ID");
    }

    private _validateMessageSearchDto(dto: MessageSearchDTO): void {
        this._validateObjectId(dto.chatId, "Chat ID");
        if (!dto.query || dto.query.trim().length === 0) {
            throw new Error("Search query is required");
        }
        if (dto.messageType && !this._isValidMessageType(dto.messageType)) {
            throw new Error("Invalid message type");
        }
    }

    private _validateMessagesByTypeDto(dto: MessagesByTypeDTO): void {
        this._validateObjectId(dto.chatId, "Chat ID");
        if (!this._isValidMessageType(dto.messageType)) {
            throw new Error("Invalid message type");
        }
    }

    private _isValidMessageType(type: string): boolean {
        return ["Text", "Image", "Video", "Audio", "File"].includes(type);
    }
}