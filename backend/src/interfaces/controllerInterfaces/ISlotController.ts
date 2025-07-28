import { Request, Response } from 'express';

export interface ISlotController {
  create(req: Request, res: Response): Promise<void>;
  findById(req: Request, res: Response): Promise<void>;
  findByShopAndDateRange(req: Request, res: Response): Promise<void>;
  findByShop(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  cancel(req: Request, res: Response): Promise<void>;
  findByDate(req: Request, res: Response): Promise<void>;
  findBookedByShop(req: Request, res: Response): Promise<void>;
}