import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { PetTypeService } from '../../services/pet/petType.service';
import { NextFunction } from 'express-serve-static-core';

export class PetTypeController {
  private petService: PetTypeService;

  constructor(petService: PetTypeService) {
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
  
}