import { Request, Response, NextFunction } from 'express';

export interface IServiceController {
  createService(req: Request, res: Response, next: NextFunction): Promise<void>;
  getServicesByShop(req: Request, res: Response, next: NextFunction): Promise<void>;
  getServiceById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getServiceByIdPublic(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateService(req: Request, res: Response, next: NextFunction): Promise<void>;
  toggleServiceStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  getServiceTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPetTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllServices(req: Request, res: Response, next: NextFunction): Promise<void>;
}