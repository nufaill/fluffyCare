import { Request, Response } from "express";
import { IMessageController } from "../../interfaces/controllerInterfaces/IMessageController";
import { IMessageService } from "../../interfaces/serviceInterfaces/IMessageService";
import {
  CreateMessageDTO,
  AddReactionDTO,
  RemoveReactionDTO,
  MessageSearchDTO,
  MarkMessagesAsReadDTO,
  UnreadCountDTO,
  MessagesByTypeDTO
} from "../../dto/message.dto";

export class MessageController implements IMessageController {
  private readonly _messageService: IMessageService;

  constructor(messageService: IMessageService) {
    this._messageService = messageService;
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, senderRole, messageType, content, mediaUrl } = req.body;

      if (!chatId || !senderRole) {
        res.status(400).json({
          success: false,
          message: "chatId and senderRole are required",
        });
        return;
      }

      if (!["User", "Shop"].includes(senderRole)) {
        res.status(400).json({
          success: false,
          message: "senderRole must be either 'User' or 'Shop'",
        });
        return;
      }

      const createMessageDto: CreateMessageDTO = {
        chatId,
        senderRole,
        messageType,
        content,
        mediaUrl,
      };

      const message = await this._messageService.createMessage(createMessageDto);

      res.status(201).json({
        success: true,
        message: "Message created successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: "Message ID is required",
        });
        return;
      }

      const message = await this._messageService.findMessageById(messageId);

      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Message retrieved successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const messageList = await this._messageService.getChatMessages(chatId, page, limit);

      res.status(200).json({
        success: true,
        message: "Chat messages retrieved successfully",
        data: messageList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get chat messages",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getLatestMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const message = await this._messageService.getLatestMessage(chatId);

      if (!message) {
        res.status(404).json({
          success: false,
          message: "No messages found in this chat",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Latest message retrieved successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get latest message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markAsDelivered(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { deliveredAt } = req.body;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: "Message ID is required",
        });
        return;
      }

      const deliveredDate = deliveredAt ? new Date(deliveredAt) : new Date();
      const message = await this._messageService.markAsDelivered(messageId, deliveredDate);

      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Message marked as delivered successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark message as delivered",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { readAt } = req.body;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: "Message ID is required",
        });
        return;
      }

      const readDate = readAt ? new Date(readAt) : new Date();
      const message = await this._messageService.markAsRead(messageId, readDate);

      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Message marked as read successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark message as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markMultipleAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { messageIds, readAt } = req.body;

      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "messageIds array is required and cannot be empty",
        });
        return;
      }

      const readDate = readAt ? new Date(readAt) : new Date();
      const modifiedCount = await this._messageService.markMultipleAsRead(messageIds, readDate);

      res.status(200).json({
        success: true,
        message: `${modifiedCount} messages marked as read successfully`,
        data: { modifiedCount },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark multiple messages as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markChatMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { receiverRole, messageIds, readAt } = req.body;

      if (!chatId || !receiverRole) {
        res.status(400).json({
          success: false,
          message: "chatId and receiverRole are required",
        });
        return;
      }

      if (!["User", "Shop"].includes(receiverRole)) {
        res.status(400).json({
          success: false,
          message: "receiverRole must be either 'User' or 'Shop'",
        });
        return;
      }

      const markMessagesDto: MarkMessagesAsReadDTO = {
        chatId,
        receiverRole,
        messageIds,
      };

      const readDate = readAt ? new Date(readAt) : new Date();
      const modifiedCount = await this._messageService.markChatMessagesAsRead(markMessagesDto, readDate);

      res.status(200).json({
        success: true,
        message: `${modifiedCount} messages marked as read successfully`,
        data: { modifiedCount },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark chat messages as read",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { receiverRole } = req.query;

      if (!chatId || !receiverRole) {
        res.status(400).json({
          success: false,
          message: "chatId and receiverRole are required",
        });
        return;
      }

      if (!["User", "Shop"].includes(receiverRole as string)) {
        res.status(400).json({
          success: false,
          message: "receiverRole must be either 'User' or 'Shop'",
        });
        return;
      }

      const unreadCountDto: UnreadCountDTO = {
        chatId,
        receiverRole: receiverRole as "User" | "Shop",
      };

      const unreadCount = await this._messageService.getUnreadCount(unreadCountDto);

      res.status(200).json({
        success: true,
        message: "Unread count retrieved successfully",
        data: { unreadCount },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get unread count",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async addReaction(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;

      if (!messageId || !userId || !emoji) {
        res.status(400).json({
          success: false,
          message: "messageId, userId, and emoji are required",
        });
        return;
      }

      const addReactionDto: AddReactionDTO = {
        messageId,
        userId,
        emoji,
      };

      const message = await this._messageService.addReaction(addReactionDto);

      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Reaction added successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to add reaction",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async removeReaction(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { userId } = req.body;

      if (!messageId || !userId) {
        res.status(400).json({
          success: false,
          message: "messageId and userId are required",
        });
        return;
      }

      const removeReactionDto: RemoveReactionDTO = {
        messageId,
        userId,
      };

      const message = await this._messageService.removeReaction(removeReactionDto);

      if (!message) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Reaction removed successfully",
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to remove reaction",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { query, messageType } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!chatId || !query) {
        res.status(400).json({
          success: false,
          message: "chatId and query are required",
        });
        return;
      }

      const searchDto: MessageSearchDTO = {
        chatId,
        query: query as string,
        messageType: messageType as "Text" | "Image" | "Video" | "Audio" | "File" | undefined,
        page,
        limit,
      };

      const searchResults = await this._messageService.searchMessages(searchDto);

      res.status(200).json({
        success: true,
        message: "Messages searched successfully",
        data: searchResults,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to search messages",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: "Message ID is required",
        });
        return;
      }

      const deleted = await this._messageService.deleteMessage(messageId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Message not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const deletedCount = await this._messageService.deleteChatMessages(chatId);

      res.status(200).json({
        success: true,
        message: `${deletedCount} messages deleted successfully`,
        data: { deletedCount },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete chat messages",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getMessagesByType(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, messageType } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!chatId || !messageType) {
        res.status(400).json({
          success: false,
          message: "chatId and messageType are required",
        });
        return;
      }

      const validTypes = ["Text", "Image", "Video", "Audio", "File"];
      if (!validTypes.includes(messageType)) {
        res.status(400).json({
          success: false,
          message: "Invalid messageType. Must be one of: Text, Image, Video, Audio, File",
        });
        return;
      }

      const messagesByTypeDto: MessagesByTypeDTO = {
        chatId,
        messageType: messageType as "Text" | "Image" | "Video" | "Audio" | "File",
        page,
        limit,
      };

      const messageList = await this._messageService.getMessagesByType(messagesByTypeDto);

      res.status(200).json({
        success: true,
        message: `${messageType} messages retrieved successfully`,
        data: messageList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get messages by type",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getChatMessageStats(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          message: "Chat ID is required",
        });
        return;
      }

      const stats = await this._messageService.getChatMessageStats(chatId);

      res.status(200).json({
        success: true,
        message: "Chat message statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get chat message stats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}