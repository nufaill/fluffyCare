import { Request, Response } from 'express';
import { IMessageController } from '../../interfaces/controllerInterfaces/IMessageController';
import { IChatService } from '../../interfaces/serviceInterfaces/IChatService';
import { IMessageService } from '../../interfaces/serviceInterfaces/IMessageService';
import { ISocketService } from '../../interfaces/serviceInterfaces/ISocketService';
import {
  CreateMessageDTO,
  AddReactionDTO,
  RemoveReactionDTO,
  MessageSearchDTO,
  MarkMessagesAsReadDTO,
  UnreadCountDTO,
  MessagesByTypeDTO,
} from '../../dto/message.dto';
import { BaseController } from './base.controller';

export class MessageController extends BaseController implements IMessageController {
  private readonly messageService: IMessageService;
  private readonly chatService: IChatService;
  private readonly socketService: ISocketService;

  constructor(
    messageService: IMessageService,
    chatService: IChatService,
    socketService: ISocketService
  ) {
    super();
    this.messageService = messageService;
    this.chatService = chatService;
    this.socketService = socketService;
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, senderRole, messageType, content, mediaUrl, senderId, receiverId } = req.body;

      const validationError = this.validateRequiredFields({ chatId, senderRole });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      if (!['User', 'Shop'].includes(senderRole)) {
        this.sendErrorResponse(res, 400, "senderRole must be either 'User' or 'Shop'");
        return;
      }

      const createMessageDto: CreateMessageDTO = {
        chatId,
        senderRole,
        messageType: messageType || 'Text',
        content: content || '',
        mediaUrl: mediaUrl || '',
      };

      const message = await this.messageService.createMessage(createMessageDto);

      const updateData = {
        lastMessage: content || (mediaUrl ? `[${messageType || 'Text'}]` : 'New message'),
        lastMessageType: (messageType || 'Text') as 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
        lastMessageAt: new Date(),
      };

      await this.chatService.updateLastMessage(chatId, updateData);

      // Emit socket events
      this.socketService.emitNewMessage({
        chatId,
        messageId: message.id,
        senderId: senderId || 'unknown',
        senderRole,
        receiverId: receiverId || 'unknown',
        messageType: messageType || 'Text',
        content: content || '',
        mediaUrl: mediaUrl || '',
        timestamp: new Date().toISOString(),
      });

      this.socketService.emitChatUpdate(chatId, {
        type: 'chat-updated',
        lastMessage: updateData.lastMessage,
        lastMessageType: updateData.lastMessageType,
        lastMessageAt: updateData.lastMessageAt.toISOString(),
      });

      this.sendSuccessResponse(res, 201, 'Message created successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to create message');
    }
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        this.sendErrorResponse(res, 400, 'Message ID is required');
        return;
      }

      const message = await this.messageService.findMessageById(messageId);

      if (!message) {
        this.sendErrorResponse(res, 404, 'Message not found');
        return;
      }

      this.sendSuccessResponse(res, 200, 'Message retrieved successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get message');
    }
  }

  async markAsDelivered(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { deliveredAt, userId } = req.body;

      if (!messageId) {
        this.sendErrorResponse(res, 400, 'Message ID is required');
        return;
      }

      const deliveredDate = deliveredAt ? new Date(deliveredAt) : new Date();
      const message = await this.messageService.markAsDelivered(messageId, deliveredDate);

      if (!message) {
        this.sendErrorResponse(res, 404, 'Message not found');
        return;
      }

      this.socketService.emitMessageStatus({
        messageId,
        chatId: message.chatId,
        status: 'delivered',
        timestamp: deliveredDate.toISOString(),
        userId: userId || 'unknown',
      });

      this.sendSuccessResponse(res, 200, 'Message marked as delivered successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to mark message as delivered');
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { readAt, userId } = req.body;

      if (!messageId) {
        this.sendErrorResponse(res, 400, 'Message ID is required');
        return;
      }

      const readDate = readAt ? new Date(readAt) : new Date();
      const message = await this.messageService.markAsRead(messageId, readDate);

      if (!message) {
        this.sendErrorResponse(res, 404, 'Message not found');
        return;
      }

      this.socketService.emitMessageStatus({
        messageId,
        chatId: message.chatId,
        status: 'read',
        timestamp: readDate.toISOString(),
        userId: userId || 'unknown'
      });

      this.sendSuccessResponse(res, 200, 'Message marked as read successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to mark message as read');
    }
  }

  async markMultipleAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageIds, readAt, userId, chatId } = req.body;

      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        this.sendErrorResponse(res, 400, 'messageIds array is required and cannot be empty');
        return;
      }

      const readDate = readAt ? new Date(readAt) : new Date();
      const modifiedCount = await this.messageService.markMultipleAsRead(messageIds, readDate);

      if (chatId) {
        this.socketService.emitMessageStatus({
          messageId: 'multiple',
          chatId,
          status: 'read',
          timestamp: readDate.toISOString(),
          userId: userId || 'unknown'
        });
      }

      this.sendSuccessResponse(
        res,
        200,
        `${modifiedCount} messages marked as read successfully`,
        { modifiedCount }
      );
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to mark multiple messages as read');
    }
  }

  async markChatMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { receiverRole, messageIds, readAt, userId } = req.body;

      const validationError = this.validateRequiredFields({ chatId, receiverRole });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      if (!['User', 'Shop'].includes(receiverRole)) {
        this.sendErrorResponse(res, 400, "receiverRole must be either 'User' or 'Shop'");
        return;
      }

      const markMessagesDto: MarkMessagesAsReadDTO = {
        chatId,
        receiverRole,
        messageIds,
      };

      const readDate = readAt ? new Date(readAt) : new Date();
      const modifiedCount = await this.messageService.markChatMessagesAsRead(markMessagesDto, readDate);

      this.socketService.emitMessageStatus({
        messageId: 'chat-messages',
        chatId,
        status: 'read',
        timestamp: readDate.toISOString(),
        userId: userId || 'unknown'
      });

      this.sendSuccessResponse(
        res,
        200,
        `${modifiedCount} messages marked as read successfully`,
        { modifiedCount }
      );
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to mark chat messages as read');
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { receiverRole } = req.query;

      const validationError = this.validateRequiredFields({ chatId, receiverRole });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      if (!['User', 'Shop'].includes(receiverRole as string)) {
        this.sendErrorResponse(res, 400, "receiverRole must be either 'User' or 'Shop'");
        return;
      }

      const unreadCountDto: UnreadCountDTO = {
        chatId,
        receiverRole: receiverRole as 'User' | 'Shop',
      };

      const unreadCount = await this.messageService.getUnreadCount(unreadCountDto);

      this.sendSuccessResponse(res, 200, 'Unread count retrieved successfully', { unreadCount });
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get unread count');
    }
  }

  async addReaction(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;

      const validationError = this.validateRequiredFields({ messageId, userId, emoji });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      const addReactionDto: AddReactionDTO = {
        messageId,
        userId,
        emoji,
      };

      const message = await this.messageService.addReaction(addReactionDto);

      if (!message) {
        this.sendErrorResponse(res, 404, 'Message not found');
        return;
      }

      this.socketService.emitMessageReaction({
        messageId,
        chatId: message.chatId,
        userId,
        emoji,
        action: 'add',
        timestamp: new Date().toISOString()
      });

      this.sendSuccessResponse(res, 200, 'Reaction added successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to add reaction');
    }
  }

  async removeReaction(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      const validationError = this.validateRequiredFields({ messageId, userId });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      const removeReactionDto: RemoveReactionDTO = {
        messageId,
        userId,
      };

      const message = await this.messageService.removeReaction(removeReactionDto);

      if (!message) {
        this.sendErrorResponse(res, 404, 'Message not found');
        return;
      }

      this.socketService.emitMessageReaction({
        messageId,
        chatId: message.chatId,
        userId,
        emoji: '',
        action: 'remove',
        timestamp: new Date().toISOString()
      });

      this.sendSuccessResponse(res, 200, 'Reaction removed successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to remove reaction');
    }
  }

  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { query, messageType } = req.query;
      const page = this.parseIntOrDefault(req.query.page as string, 1);
      const limit = this.parseIntOrDefault(req.query.limit as string, 20);

      const validationError = this.validateRequiredFields({ chatId, query });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      const searchDto: MessageSearchDTO = {
        chatId,
        query: query as string,
        messageType: messageType as 'Text' | 'Image' | 'Video' | 'Audio' | 'File' | undefined,
        page,
        limit,
      };

      const searchResults = await this.messageService.searchMessages(searchDto);

      this.sendSuccessResponse(res, 200, 'Messages searched successfully', searchResults);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to search messages');
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { chatId } = req.body;

      if (!messageId) {
        this.sendErrorResponse(res, 400, 'Message ID is required');
        return;
      }

      const deleted = await this.messageService.deleteMessage(messageId);

      if (!deleted) {
        this.sendErrorResponse(res, 404, 'Message not found');
        return;
      }

      if (chatId) {
        this.socketService.emitChatUpdate(chatId, {
          type: 'message-deleted',
          messageId
        });
      }

      this.sendSuccessResponse(res, 200, 'Message deleted successfully');
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to delete message');
    }
  }

  async deleteChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const deletedCount = await this.messageService.deleteChatMessages(chatId);

      this.socketService.emitChatUpdate(chatId, {
        type: 'chat-messages-deleted',
        deletedCount
      });

      this.sendSuccessResponse(
        res,
        200,
        `${deletedCount} messages deleted successfully`,
        { deletedCount }
      );
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to delete chat messages');
    }
  }

  async getMessagesByType(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, messageType } = req.params;
      const page = this.parseIntOrDefault(req.query.page as string, 1);
      const limit = this.parseIntOrDefault(req.query.limit as string, 20);

      const validationError = this.validateRequiredFields({ chatId, messageType });
      if (validationError) {
        this.sendErrorResponse(res, 400, validationError);
        return;
      }

      const validTypes = ['Text', 'Image', 'Video', 'Audio', 'File'];
      if (!validTypes.includes(messageType)) {
        this.sendErrorResponse(
          res,
          400,
          'Invalid messageType. Must be one of: Text, Image, Video, Audio, File'
        );
        return;
      }

      const messagesByTypeDto: MessagesByTypeDTO = {
        chatId,
        messageType: messageType as 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
        page,
        limit,
      };

      const messageList = await this.messageService.getMessagesByType(messagesByTypeDto);

      this.sendSuccessResponse(res, 200, `${messageType} messages retrieved successfully`, messageList);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get messages by type');
    }
  }

  async getChatMessageStats(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const stats = await this.messageService.getChatMessageStats(chatId);

      this.sendSuccessResponse(res, 200, 'Chat message statistics retrieved successfully', stats);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get chat message stats');
    }
  }

  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      let page = this.parseIntOrDefault(req.query.page as string, 1);
      const limit = this.parseIntOrDefault(req.query.limit as string, 50);

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      // Handle edge case where page=0 is sent (treat as page=1)
      if (page <= 0) {
        console.log(`getChatMessages: Adjusting page from ${page} to 1`);
        page = 1;
      }

      const messageList = await this.messageService.getChatMessages(chatId, page, limit);

      if (messageList.totalMessages > 0 && (!messageList.messages || messageList.messages.length === 0)) {
        console.warn(`getChatMessages: Data inconsistency detected - total=${messageList.totalMessages} but messages array is empty`);
      }

      this.sendSuccessResponse(res, 200, 'Chat messages retrieved successfully', messageList);
    } catch (error) {
      console.error(`getChatMessages: Error for chatId=${req.params.chatId}:`, error);
      this.handleControllerError(res, error, 'Failed to get chat messages');
    }
  }

  async getLatestMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        this.sendErrorResponse(res, 400, 'Chat ID is required');
        return;
      }

      const message = await this.messageService.getLatestMessage(chatId);

      if (!message) {
        this.sendErrorResponse(res, 404, 'No messages found in this chat');
        return;
      }

      this.sendSuccessResponse(res, 200, 'Latest message retrieved successfully', message);
    } catch (error) {
      this.handleControllerError(res, error, 'Failed to get latest message');
    }
  }
}