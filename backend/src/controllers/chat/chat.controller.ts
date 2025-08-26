import { Request, Response } from 'express';
import { IChatController } from '../../interfaces/controllerInterfaces/IChatController';
import { IChatService } from '../../interfaces/serviceInterfaces/IChatService';
import { ISocketService } from '../../interfaces/serviceInterfaces/ISocketService';
import { CreateChatDTO, ChatSearchDTO } from '../../dto/chat.dto';
import { BaseController } from './base.controller';

export class ChatController extends BaseController implements IChatController {
  private readonly chatService: IChatService;
  private readonly socketService: ISocketService;

  constructor(chatService: IChatService, socketService: ISocketService) {
    super();
    this.chatService = chatService;
    this.socketService = socketService;
  }

  async createChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, shopId } = req.body;

      const validationError = this.validateRequiredFields({ userId, shopId });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      const createChatDto: CreateChatDTO = { userId, shopId };
      const chat = await this.chatService.createChat(createChatDto);

      // Emit socket event for new chat creation
      this.socketService.emitChatUpdate(chat.id, {
        type: 'chat-created',
        chat,
      });

      this.sendSuccessResponse(res, 201, 'Chat created successfully', chat);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to create chat');
    }
  }

  async getChatById(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const chat = await this.chatService.findChatById(chatId);

      if (!chat) {
        this.sendErrorResponse(res, 404, 'Chat not found');
        return;
      }

      this.sendSuccessResponse(res, 200, 'Chat retrieved successfully', chat);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get chat');
    }
  }

  async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = this.parseIntOrDefault(req.query.page as string, 1);
      const limit = this.parseIntOrDefault(req.query.limit as string, 20);

      if (!userId) {
        this.sendErrorResponse(res, 400, 'User ID is required');
        return;
      }

      const chatList = await this.chatService.getUserChats(userId, page, limit);

      this.sendSuccessResponse(res, 200, 'User chats retrieved successfully', chatList);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get user chats');
    }
  }

  async getShopChats(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const page = this.parseIntOrDefault(req.query.page as string, 1);
      const limit = this.parseIntOrDefault(req.query.limit as string, 20);

      if (!shopId) {
        this.sendErrorResponse(res, 400, 'Shop ID is required');
        return;
      }

      const chatList = await this.chatService.getShopChats(shopId, page, limit);

      this.sendSuccessResponse(res, 200, 'Shop chats retrieved successfully', chatList);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get shop chats');
    }
  }

  async getOrCreateChat(req: Request, res: Response): Promise<void> {
    try {
      const { userId, shopId } = req.body;

      const validationError = this.validateRequiredFields({ userId, shopId });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      const chat = await this.chatService.getOrCreateChat(userId, shopId);

      this.sendSuccessResponse(res, 200, 'Chat retrieved or created successfully', chat);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get or create chat');
    }
  }

  async updateLastMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { lastMessage, lastMessageType, lastMessageAt } = req.body;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const updatedChat = await this.chatService.updateLastMessage(chatId, {
        lastMessage: lastMessage || '',
        lastMessageType: lastMessageType || 'Text',
        lastMessageAt: lastMessageAt ? new Date(lastMessageAt) : new Date(),
      });

      if (!updatedChat) {
        this.sendErrorResponse(res, 404, 'Chat not found');
        return;
      }

      this.sendSuccessResponse(res, 200, 'Last message updated successfully', updatedChat);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to update last message');
    }
  }

  async incrementUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const updatedChat = await this.chatService.incrementUnreadCount(chatId);

      if (!updatedChat) {
        this.sendErrorResponse(res, 404, 'Chat not found');
        return;
      }

      this.socketService.emitChatUpdate(chatId, {
        type: 'unread-count-incremented',
        unreadCount: updatedChat.unreadCount,
      });

      this.sendSuccessResponse(res, 200, 'Unread count incremented successfully', updatedChat);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to increment unread count');
    }
  }

  async resetUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const updatedChat = await this.chatService.resetUnreadCount(chatId);

      if (!updatedChat) {
        this.sendErrorResponse(res, 404, 'Chat not found');
        return;
      }

      this.socketService.emitChatUpdate(chatId, {
        type: 'unread-count-reset',
        unreadCount: 0,
      });

      this.sendSuccessResponse(res, 200, 'Unread count reset successfully', updatedChat);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to reset unread count');
    }
  }

  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const deleted = await this.chatService.deleteChat(chatId);

      if (!deleted) {
        this.sendErrorResponse(res, 404, 'Chat not found');
        return;
      }

      this.socketService.emitChatUpdate(chatId, {
        type: 'chat-deleted',
      });

      this.sendSuccessResponse(res, 200, 'Chat deleted successfully');
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to delete chat');
    }
  }

  async searchChats(req: Request, res: Response): Promise<void> {
    try {
      const { query, searcherId, searcherRole } = req.query;
      const page = this.parseIntOrDefault(req.query.page as string, 1);
      const limit = this.parseIntOrDefault(req.query.limit as string, 20);

      const validationError = this.validateRequiredFields({ 
        query, 
        searcherId, 
        searcherRole 
      });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      if (!['User', 'Shop'].includes(searcherRole as string)) {
        this.sendErrorResponse(res, 400, "searcherRole must be either 'User' or 'Shop'");
        return;
      }

      const searchDto: ChatSearchDTO = {
        query: query as string,
        searcherRole: searcherRole as 'User' | 'Shop',
        page,
        limit,
      };

      const searchResults = await this.chatService.searchChats(searchDto);

      this.sendSuccessResponse(res, 200, 'Chats searched successfully', searchResults);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to search chats');
    }
  }

  async getTotalUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId, role } = req.params;

      const validationError = this.validateRequiredFields({ userId, role });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      if (!['User', 'Shop'].includes(role)) {
        this.sendErrorResponse(res, 400, "role must be either 'User' or 'Shop'");
        return;
      }

      const unreadCount = await this.chatService.getTotalUnreadCount(
        userId,
        role as 'User' | 'Shop',
      );

      this.sendSuccessResponse(res, 200, 'Total unread count retrieved successfully', unreadCount);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get total unread count');
    }
  }
}