import { Request, Response } from "express";
import { IChatController } from "../../interfaces/controllerInterfaces/IChatController";
import { IChatService } from "../../interfaces/serviceInterfaces/IChatService";
import { CreateChatDTO, ChatSearchDTO } from "../../dto/chat.dto";

export class ChatController implements IChatController {
  private readonly _chatService: IChatService;

  constructor(chatService: IChatService) {
    this._chatService = chatService;
  }

  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, shopId } = req.body;

      if (!userId || !shopId) {
        res.status(400).json({
          success: false,
          message: "userId and shopId are required",
        });
        return;
      }

      const createChatDto: CreateChatDTO = { userId, shopId };
      const chat = await this._chatService.createChat(createChatDto);

      res.status(201).json({
        success: true,
        message: "Chat created successfully",
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create chat",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const chat = await this._chatService.findChatById(chatId);

      if (!chat) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Chat retrieved successfully",
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get chat",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "User ID is required",
        });
        return;
      }

      const chatList = await this._chatService.getUserChats(userId, page, limit);

      res.status(200).json({
        success: true,
        message: "User chats retrieved successfully",
        data: chatList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get user chats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getShopChats(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!shopId) {
        res.status(400).json({
          success: false,
          message: "Shop ID is required",
        });
        return;
      }

      const chatList = await this._chatService.getShopChats(shopId, page, limit);

      res.status(200).json({
        success: true,
        message: "Shop chats retrieved successfully",
        data: chatList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get shop chats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getOrCreateChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, shopId } = req.body;

      if (!userId || !shopId) {
        res.status(400).json({
          success: false,
          message: "userId and shopId are required",
        });
        return;
      }

      const chat = await this._chatService.getOrCreateChat(userId, shopId);

      res.status(200).json({
        success: true,
        message: "Chat retrieved or created successfully",
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get or create chat",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateLastMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { lastMessage, lastMessageType, lastMessageAt } = req.body;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      if (!lastMessage || !lastMessageType || !lastMessageAt) {
        res.status(400).json({
          success: false,
          message: "lastMessage, lastMessageType, and lastMessageAt are required",
        });
        return;
      }

      const updateData = {
        lastMessage,
        lastMessageType,
        lastMessageAt: new Date(lastMessageAt),
      };

      const updatedChat = await this._chatService.updateLastMessage(chatId, updateData);

      if (!updatedChat) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Last message updated successfully",
        data: updatedChat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update last message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async incrementUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const updatedChat = await this._chatService.incrementUnreadCount(chatId);

      if (!updatedChat) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Unread count incremented successfully",
        data: updatedChat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to increment unread count",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async resetUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const updatedChat = await this._chatService.resetUnreadCount(chatId);

      if (!updatedChat) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Unread count reset successfully",
        data: updatedChat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to reset unread count",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const deleted = await this._chatService.deleteChat(chatId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Chat not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Chat deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete chat",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async searchChats(req: Request, res: Response): Promise<void> {
    try {
      const { query, searcherId, searcherRole } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || !searcherId || !searcherRole) {
        res.status(400).json({
          success: false,
          message: "query, searcherId, and searcherRole are required",
        });
        return;
      }

      if (!["User", "Shop"].includes(searcherRole as string)) {
        res.status(400).json({
          success: false,
          message: "searcherRole must be either 'User' or 'Shop'",
        });
        return;
      }

      const searchDto: ChatSearchDTO = {
        query: query as string,
        searcherRole: searcherRole as "User" | "Shop",
        page,
        limit,
      };

      const searchResults = await this._chatService.searchChats(searchDto);

      res.status(200).json({
        success: true,
        message: "Chats searched successfully",
        data: searchResults,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to search chats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getTotalUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId, role } = req.params;

      if (!userId || !role) {
        res.status(400).json({
          success: false,
          message: "userId and role are required",
        });
        return;
      }

      if (!["User", "Shop"].includes(role)) {
        res.status(400).json({
          success: false,
          message: "role must be either 'User' or 'Shop'",
        });
        return;
      }

      const unreadCount = await this._chatService.getTotalUnreadCount(
        userId,
        role as "User" | "Shop"
      );

      res.status(200).json({
        success: true,
        message: "Total unread count retrieved successfully",
        data: unreadCount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get total unread count",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}