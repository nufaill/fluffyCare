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

export interface IMessageService {
    createMessage(dto: CreateMessageDTO): Promise<MessageResponseDTO>;
    findMessageById(messageId: string): Promise<MessageResponseDTO | null>;
    getChatMessages(chatId: string, page?: number, limit?: number): Promise<MessageListResponseDTO>;
    getLatestMessage(chatId: string): Promise<MessageResponseDTO | null>;
    markAsDelivered(messageId: string, deliveredAt?: Date): Promise<MessageResponseDTO | null>;
    markAsRead(messageId: string, readAt?: Date): Promise<MessageResponseDTO | null>;
    markMultipleAsRead(messageIds: string[], readAt?: Date): Promise<number>;
    markChatMessagesAsRead(dto: MarkMessagesAsReadDTO, readAt?: Date): Promise<number>;
    getUnreadCount(dto: UnreadCountDTO): Promise<number>;
    addReaction(dto: AddReactionDTO): Promise<MessageResponseDTO | null>;
    removeReaction(dto: RemoveReactionDTO): Promise<MessageResponseDTO | null>;
    searchMessages(dto: MessageSearchDTO): Promise<MessageListResponseDTO>;
    deleteMessage(messageId: string): Promise<boolean>;
    deleteChatMessages(chatId: string): Promise<number>;
    getMessagesByType(dto: MessagesByTypeDTO): Promise<MessageListResponseDTO>;
    getChatMessageStats(chatId: string): Promise<MessageStatsResponseDTO>;
}