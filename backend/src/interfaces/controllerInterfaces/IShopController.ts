import { Request, Response, NextFunction } from 'express';

export interface IShopController {
  getAllShops(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShopStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUnverifiedShops(req: Request, res: Response, next: NextFunction): Promise<void>;
  approveShop(req: Request, res: Response, next: NextFunction): Promise<void>;
  rejectShop(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShopProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShopProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}