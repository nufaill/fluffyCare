import { Request, Response } from "express";

export interface IMessageController {
  createMessage(req: Request, res: Response): Promise<void>;
  getMessageById(req: Request, res: Response): Promise<void>;
  getChatMessages(req: Request, res: Response): Promise<void>;
  getLatestMessage(req: Request, res: Response): Promise<void>;
  markAsDelivered(req: Request, res: Response): Promise<void>;
  markAsRead(req: Request, res: Response): Promise<void>;
  markMultipleAsRead(req: Request, res: Response): Promise<void>;
  markChatMessagesAsRead(req: Request, res: Response): Promise<void>;
  getUnreadCount(req: Request, res: Response): Promise<void>;
  addReaction(req: Request, res: Response): Promise<void>;
  removeReaction(req: Request, res: Response): Promise<void>;
  searchMessages(req: Request, res: Response): Promise<void>;
  deleteMessage(req: Request, res: Response): Promise<void>;
  deleteChatMessages(req: Request, res: Response): Promise<void>;
  getMessagesByType(req: Request, res: Response): Promise<void>;
  getChatMessageStats(req: Request, res: Response): Promise<void>;
}