import { Request, Response } from "express";

export interface IChatController {
  createChat(req: Request, res: Response): Promise<void>;
  getChatById(req: Request, res: Response): Promise<void>;
  getUserChats(req: Request, res: Response): Promise<void>;
  getShopChats(req: Request, res: Response): Promise<void>;
  getOrCreateChat(req: Request, res: Response): Promise<void>;
  updateLastMessage(req: Request, res: Response): Promise<void>;
  incrementUnreadCount(req: Request, res: Response): Promise<void>;
  resetUnreadCount(req: Request, res: Response): Promise<void>;
  deleteChat(req: Request, res: Response): Promise<void>;
  searchChats(req: Request, res: Response): Promise<void>;
  getTotalUnreadCount(req: Request, res: Response): Promise<void>;
}