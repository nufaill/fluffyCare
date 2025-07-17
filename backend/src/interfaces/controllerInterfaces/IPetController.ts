import { Request, Response, NextFunction } from 'express';
import { CreatePetDTO, UpdatePetDTO } from '../../dto/pet.dto';

export interface IPetController {
  createPet(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllPetTypes(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPetsByUserId(req: Request, res: Response, next: NextFunction): Promise<void>;
  getPetById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePet(req: Request, res: Response, next: NextFunction): Promise<void>;
}