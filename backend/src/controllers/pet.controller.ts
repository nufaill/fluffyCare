import { Request, Response } from 'express';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../shared/constant';
import { PetService } from '../services/petServices';
import { CustomError } from '../util/CustomerError';
import { NextFunction } from 'express-serve-static-core';

export class PetController {
  private petService: PetService;

  constructor(petService: PetService) {
    this.petService = petService;
  }

  createPetType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type name is required and must be a non-empty string'
        });
      }

      const newPetType = await this.petService.createPetType({ name });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: newPetType
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

  getPetTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
      }

      const petType = await this.petService.getPetTypeById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: petType
      });
    } catch (error) {
      next(error);
    }
  };

  updatePetType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type name is required and must be a non-empty string'
        });
      }

      const updatedPetType = await this.petService.updatePetType(id, { name });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedPetType
      });
    } catch (error) {
      next(error);
    }
  };

  updatePetTypeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const updatedPetType = await this.petService.updatePetTypeStatus(id, isActive);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedPetType
      });
    } catch (error) {
      next(error);
    }
  };
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