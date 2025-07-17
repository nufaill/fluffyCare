import { Request, Response, NextFunction } from 'express';

export interface IPetTypeController {
  createPetType(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllPetTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPetTypeById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePetType(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePetTypeStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}