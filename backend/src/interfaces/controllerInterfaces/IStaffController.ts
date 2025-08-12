import { Request, Response, NextFunction } from 'express';

export interface IStaffController {
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  findById(req: Request, res: Response, next: NextFunction): Promise<void>;
  findByShopId(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllStaff(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  findByEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}