import { Request, Response } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { NextFunction } from 'express-serve-static-core';
import { ServiceTypeService } from '../../services/service/serviceType.service';
import { CreateServiceTypeDTO, UpdateServiceTypeDTO, UpdateServiceTypeStatusDTO } from '../../dto/serviceType.dto';

export class ServiceTypeController {
  private serviceTypeService: ServiceTypeService;

  constructor(serviceTypeService: ServiceTypeService) {
    this.serviceTypeService = serviceTypeService;
  }

  createServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceTypeData: CreateServiceTypeDTO = req.body;

      // Validate DTO
      if (!serviceTypeData.name || typeof serviceTypeData.name !== 'string' || serviceTypeData.name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type name is required and must be a non-empty string'
        });
      }

      const newServiceType = await this.serviceTypeService.createServiceType(serviceTypeData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
        data: newServiceType
      });
    } catch (error) {
      next(error);
    }
  };

  getAllServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serviceTypes = await this.serviceTypeService.getAllServiceTypes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: serviceTypes
      });
    } catch (error) {
      next(error);
    }
  };

  getServiceTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type ID is required'
        });
      }

      const serviceType = await this.serviceTypeService.getServiceTypeById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: serviceType
      });
    } catch (error) {
      next(error);
    }
  };

  updateServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const serviceTypeData: UpdateServiceTypeDTO = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type ID is required'
        });
      }

      if (!serviceTypeData.name || typeof serviceTypeData.name !== 'string' || serviceTypeData.name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type name is required and must be a non-empty string'
        });
      }

      const updatedServiceType = await this.serviceTypeService.updateServiceType(id, serviceTypeData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedServiceType
      });
    } catch (error) {
      next(error);
    }
  };

  updateServiceTypeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const statusData: UpdateServiceTypeStatusDTO = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type ID is required'
        });
      }

      if (typeof statusData.isActive !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const updatedServiceType = await this.serviceTypeService.updateServiceTypeStatus(id, statusData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedServiceType
      });
    } catch (error) {
      next(error);
    }
  };
}