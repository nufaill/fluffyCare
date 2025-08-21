import { Request, Response } from "express";

export interface IChatController {
  /**
   * Create a new chat between user and shop
   * POST /chats
   */
  createChat(req: Request, res: Response): Promise<void>;

  /**
   * Get chat by ID
   * GET /chats/:chatId
   */
  getChatById(req: Request, res: Response): Promise<void>;

  /**
   * Get all chats for a user
   * GET /users/:userId/chats
   */
  getUserChats(req: Request, res: Response): Promise<void>;

  /**
   * Get all chats for a shop
   * GET /shops/:shopId/chats
   */
  getShopChats(req: Request, res: Response): Promise<void>;

  /**
   * Get or create chat between user and shop
   * POST /chats/get-or-create
   */
  getOrCreateChat(req: Request, res: Response): Promise<void>;

  /**
   * Update last message in chat
   * PUT /chats/:chatId/last-message
   */
  updateLastMessage(req: Request, res: Response): Promise<void>;

  /**
   * Increment unread count for a chat
   * PUT /chats/:chatId/increment-unread
   */
  incrementUnreadCount(req: Request, res: Response): Promise<void>;

  /**
   * Reset unread count for a chat
   * PUT /chats/:chatId/reset-unread
   */
  resetUnreadCount(req: Request, res: Response): Promise<void>;

  /**
   * Delete a chat
   * DELETE /chats/:chatId
   */
  deleteChat(req: Request, res: Response): Promise<void>;

  /**
   * Search chats for a user or shop
   * GET /chats/search
   */
  searchChats(req: Request, res: Response): Promise<void>;

  /**
   * Get total unread count for user or shop
   * GET /chats/unread-count/:userId/:role
   */
  getTotalUnreadCount(req: Request, res: Response): Promise<void>;
}