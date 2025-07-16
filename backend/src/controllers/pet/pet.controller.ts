import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { PetService } from '../../services/pet/pet.service';
import { NextFunction } from 'express-serve-static-core';
import { CreatePetDTO, UpdatePetDTO } from '../../dtos/pet.dto';

export class PetController {
  private petService: PetService;

  constructor(petService: PetService) {
    this.petService = petService;
  }

  createPet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.params.userId;
      const petData: CreatePetDTO = req.body;

      // Validation
      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required'
        });
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
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type, profile image, name, breed, age, gender, and weight are required'
        });
      }

      try {
        new URL(petData.profileImage);
      } catch {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Profile image must be a valid URL'
        });
      }

      if (!['Male', 'Female'].includes(petData.gender)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Gender must be either Male or Female'
        });
      }

      const newPet = await this.petService.createPet(userId, {
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
  };

  getAllPetTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petTypes = await this.petService.getAllPetTypes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: petTypes
      });
    } catch (error) {
      next(error);
    }
  };

  getPetsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.params.userId;

      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const pets = await this.petService.getPetsByUserId(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: pets
      });
    } catch (error) {
      next(error);
    }
  };

  getPetById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { petId } = req.params;

      if (!petId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet ID is required'
        });
      }

      const pet = await this.petService.getPetById(petId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: pet
      });
    } catch (error) {
      next(error);
    }
  };

  updatePet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { petId } = req.params;
      const userId = req.user?.userId;
      const updateData: UpdatePetDTO = req.body;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!petId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet ID is required'
        });
      }

      if (updateData.gender && !['Male', 'Female'].includes(updateData.gender)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Gender must be either Male or Female'
        });
      }

      const updatedPet = await this.petService.updatePet(petId, userId, updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedPet
      });
    } catch (error) {
      next(error);
    }
  };
}