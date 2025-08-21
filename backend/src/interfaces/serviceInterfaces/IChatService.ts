import {
    CreateChatDTO,
    UpdateChatDTO,
    ChatResponseDTO,
    ChatListResponseDTO,
    ChatSearchDTO,
    UnreadCountResponseDTO
} from "../../dto/chat.dto";

export interface IChatService {
    createChat(dto: CreateChatDTO): Promise<ChatResponseDTO>;
    findChatByUserAndShop(userId: string, shopId: string): Promise<ChatResponseDTO | null>;
    findChatById(chatId: string): Promise<ChatResponseDTO | null>;
    getUserChats(userId: string, page?: number, limit?: number): Promise<ChatListResponseDTO>;
    getShopChats(shopId: string, page?: number, limit?: number): Promise<ChatListResponseDTO>;
    updateLastMessage(
        chatId: string,
        updateData: {
            lastMessage: string;
            lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File";
            lastMessageAt: Date;
        }
    ): Promise<ChatResponseDTO | null>;
    incrementUnreadCount(chatId: string): Promise<ChatResponseDTO | null>;
    resetUnreadCount(chatId: string): Promise<ChatResponseDTO | null>;
    deleteChat(chatId: string): Promise<boolean>;
    getOrCreateChat(userId: string, shopId: string): Promise<ChatResponseDTO>;
    searchChats(dto: ChatSearchDTO): Promise<ChatListResponseDTO>;
    getTotalUnreadCount(userId: string, role: "User" | "Shop"): Promise<UnreadCountResponseDTO>;
}