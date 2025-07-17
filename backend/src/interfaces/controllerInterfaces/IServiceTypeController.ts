import { Request, Response, NextFunction } from 'express';

export interface IServiceTypeController {
  createServiceType(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllServiceTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
  getServiceTypeById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateServiceType(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateServiceTypeStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}