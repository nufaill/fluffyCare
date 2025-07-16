import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { PetTypeService } from '../../services/pet/petType.service';
import { NextFunction } from 'express-serve-static-core';
import { CreatePetTypeDTO, UpdatePetTypeDTO, UpdatePetTypeStatusDTO } from '../../dtos/petType.dto';

export class PetTypeController {
  private petService: PetTypeService;

  constructor(petService: PetTypeService) {
    this.petService = petService;
  }

  createPetType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const petTypeData: CreatePetTypeDTO = req.body;

      if (!petTypeData.name || typeof petTypeData.name !== 'string' || petTypeData.name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type name is required and must be a non-empty string'
        });
      }

      const newPetType = await this.petService.createPetType(petTypeData);

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
      const petTypeData: UpdatePetTypeDTO = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
      }

      if (!petTypeData.name || typeof petTypeData.name !== 'string' || petTypeData.name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type name is required and must be a non-empty string'
        });
      }

      const updatedPetType = await this.petService.updatePetType(id, petTypeData);

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
      const statusData: UpdatePetTypeStatusDTO = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
      }

      if (typeof statusData.isActive !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const updatedPetType = await this.petService.updatePetTypeStatus(id, statusData.isActive);

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