import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { IPetTypeService } from '../../interfaces/serviceInterfaces/IPetTypeService';
import { CreatePetTypeDTO, UpdatePetTypeDTO, UpdatePetTypeStatusDTO } from '../../dto/petType.dto';
import { IPetTypeController } from '../../interfaces/controllerInterfaces/IPetTypeController';

export class PetTypeController implements IPetTypeController {
  private _petService: IPetTypeService; 

  constructor(petService: IPetTypeService) {
    this._petService = petService;
  }

  async createPetType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const petTypeData: CreatePetTypeDTO = req.body;

      if (!petTypeData.name || typeof petTypeData.name !== 'string' || petTypeData.name.trim().length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type name is required and must be a non-empty string'
        });
        return;
      }

      const newPetType = await this._petService.createPetType(petTypeData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: newPetType
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

  async getPetTypeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
        return;
      }

      const petType = await this._petService.getPetTypeById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: petType
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePetType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const petTypeData: UpdatePetTypeDTO = req.body;

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
        return;
      }

      if (!petTypeData.name || typeof petTypeData.name !== 'string' || petTypeData.name.trim().length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type name is required and must be a non-empty string'
        });
        return;
      }

      const updatedPetType = await this._petService.updatePetType(id, petTypeData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedPetType
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePetTypeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const statusData: UpdatePetTypeStatusDTO = req.body;

      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Pet type ID is required'
        });
        return;
      }

      if (typeof statusData.isActive !== 'boolean') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
        return;
      }

      const updatedPetType = await this._petService.updatePetTypeStatus(id, statusData.isActive);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedPetType
      });
    } catch (error) {
      next(error);
    }
  }
}