import { Request, Response } from "express";

export interface IMessageController {
  /**
   * Create a new message
   * POST /messages
   */
  createMessage(req: Request, res: Response): Promise<void>;

  /**
   * Get message by ID
   * GET /messages/:messageId
   */
  getMessageById(req: Request, res: Response): Promise<void>;

  /**
   * Get messages for a specific chat
   * GET /chats/:chatId/messages
   */
  getChatMessages(req: Request, res: Response): Promise<void>;

  /**
   * Get the latest message for a chat
   * GET /chats/:chatId/messages/latest
   */
  getLatestMessage(req: Request, res: Response): Promise<void>;

  /**
   * Mark message as delivered
   * PUT /messages/:messageId/delivered
   */
  markAsDelivered(req: Request, res: Response): Promise<void>;

  /**
   * Mark message as read
   * PUT /messages/:messageId/read
   */
  markAsRead(req: Request, res: Response): Promise<void>;

  /**
   * Mark multiple messages as read
   * PUT /messages/mark-multiple-read
   */
  markMultipleAsRead(req: Request, res: Response): Promise<void>;

  /**
   * Mark all chat messages as read for a receiver
   * PUT /chats/:chatId/messages/mark-read
   */
  markChatMessagesAsRead(req: Request, res: Response): Promise<void>;

  /**
   * Get unread message count for a chat
   * GET /chats/:chatId/messages/unread-count
   */
  getUnreadCount(req: Request, res: Response): Promise<void>;

  /**
   * Add reaction to a message
   * POST /messages/:messageId/reactions
   */
  addReaction(req: Request, res: Response): Promise<void>;

  /**
   * Remove reaction from a message
   * DELETE /messages/:messageId/reactions
   */
  removeReaction(req: Request, res: Response): Promise<void>;

  /**
   * Search messages in a chat
   * GET /chats/:chatId/messages/search
   */
  searchMessages(req: Request, res: Response): Promise<void>;

  /**
   * Delete a message
   * DELETE /messages/:messageId
   */
  deleteMessage(req: Request, res: Response): Promise<void>;

  /**
   * Delete all messages in a chat
   * DELETE /chats/:chatId/messages
   */
  deleteChatMessages(req: Request, res: Response): Promise<void>;

  /**
   * Get messages by type (Text, Image, Video, Audio, File)
   * GET /chats/:chatId/messages/by-type/:messageType
   */
  getMessagesByType(req: Request, res: Response): Promise<void>;

  /**
   * Get message statistics for a chat
   * GET /chats/:chatId/messages/stats
   */
  getChatMessageStats(req: Request, res: Response): Promise<void>;
}