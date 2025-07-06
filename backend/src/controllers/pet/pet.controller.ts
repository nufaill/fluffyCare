import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { PetService } from '../../services/pet/pet.service';
import { NextFunction } from 'express-serve-static-core';

export class PetController {
  private petService: PetService;

  constructor(petService: PetService) {
    this.petService = petService;
  }
  createPet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId || req.params.userId;
      const {
        petTypeId,
        profileImage,
        name,
        breed,
        age,
        gender,
        weight,
        additionalNotes,
        friendlyWithPets,
        friendlyWithOthers,
        trainedBefore,
        vaccinationStatus,
        medication
      } = req.body;

      // Validation
      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (!petTypeId || !profileImage || !name || !breed || !age || !gender || !weight) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type, profile image, name, breed, age, gender, and weight are required'
        });
      }

      
      try {
        new URL(profileImage);
      } catch {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Profile image must be a valid URL'
        });
      }

      if (!['Male', 'Female'].includes(gender)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Gender must be either Male or Female'
        });
      }

      const newPet = await this.petService.createPet(userId, {
        petTypeId,
        profileImage,
        name: name.trim(),
        breed: breed.trim(),
        age: age,
        gender,
        weight: parseFloat(weight),
        additionalNotes: additionalNotes || '',
        friendlyWithPets: Boolean(friendlyWithPets),
        friendlyWithOthers: Boolean(friendlyWithOthers),
        trainedBefore: Boolean(trainedBefore),
        vaccinationStatus: Boolean(vaccinationStatus),
        medication: medication || ''
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
      const updateData = req.body;

      if (!petId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet ID is required'
        });
      }

      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Validate gender if provided
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