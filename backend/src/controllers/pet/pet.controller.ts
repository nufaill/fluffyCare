import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { CreatePetDTO, UpdatePetDTO } from '../../dto/pet.dto';
import { IPetService } from '../../interfaces/serviceInterfaces/IPetService';
import { IPetController } from '../../interfaces/controllerInterfaces/IPetController';

export class PetController implements IPetController {
  private _petService: IPetService;

  constructor(petService: IPetService) {
    this._petService = petService;
  }

  async createPet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || req.params.userId;
      const petData: CreatePetDTO = req.body;

      // Validation
      if (!userId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      if (
        !petData.petTypeId ||
        !petData.profileImage ||
        !petData.name ||
        !petData.breed ||
        !petData.age ||
        !petData.gender ||
        !petData.weight
      ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type, profile image, name, breed, age, gender, and weight are required'
        });
        return;
      }

      if (!['Male', 'Female'].includes(petData.gender)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Gender must be either Male or Female'
        });
        return;
      }

      const newPet = await this._petService.createPet(userId, {
        petTypeId: petData.petTypeId,
        profileImage: petData.profileImage,
        name: petData.name.trim(),
        breed: petData.breed.trim(),
        age: petData.age,
        gender: petData.gender,
        weight: petData.weight,
        additionalNotes: petData.additionalNotes || '',
        friendlyWithPets: Boolean(petData.friendlyWithPets),
        friendlyWithOthers: Boolean(petData.friendlyWithOthers),
        trainedBefore: Boolean(petData.trainedBefore),
        vaccinationStatus: Boolean(petData.vaccinationStatus),
        medication: petData.medication || ''
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: newPet
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPetTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const petTypes = await this._petService.getAllPetTypes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: petTypes
      });
    } catch (error) {
      next(error);
    }
  }

  async getPetsByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || req.params.userId;

      if (!userId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const pets = await this._petService.getPetsByUserId(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: pets
      });
    } catch (error) {
      next(error);
    }
  }

  async getPetById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { petId } = req.params;

      if (!petId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet ID is required'
        });
        return;
      }

      const pet = await this._petService.getPetById(petId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: pet
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { petId } = req.params;
      const userId = req.user?.userId;
      const updateData: UpdatePetDTO = req.body;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!petId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet ID is required'
        });
        return;
      }

      if (updateData.gender && !['Male', 'Female'].includes(updateData.gender)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Gender must be either Male or Female'
        });
        return;
      }

      const updatedPet = await this._petService.updatePet(petId, userId, updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedPet
      });
    } catch (error) {
      next(error);
    }
  }
}