import { Request, Response, NextFunction } from 'express';

export interface IShopController {
  getAllShops(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShopSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShopStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShopSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUnverifiedShops(req: Request, res: Response, next: NextFunction): Promise<void>;
  approveShop(req: Request, res: Response, next: NextFunction): Promise<void>;
  rejectShop(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShopProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShopProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShopAvailability(req: Request, res: Response): Promise<void>;
  updateShopAvailability(req: Request, res: Response): Promise<void>;
  getShopsOverview(req: Request, res: Response, next: NextFunction): Promise<void>;
}