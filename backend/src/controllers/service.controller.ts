import { Request, Response } from 'express';
import { setAuthCookies, clearAuthCookies, updateAccessTokenCookie } from '../util/cookie-helper';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../shared/constant';
import { ServiceRepository } from '../repositories/serviceTypeRepository';
import { CustomError } from '../util/CustomerError';
import { NextFunction } from 'express-serve-static-core';
import {ServiceService} from '../services/serviceType.service'

export class ServiceController {
  private serviceService: ServiceService;

  constructor(ServiceService: ServiceService) {
    this.serviceService = ServiceService;
  }

  createServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type name is required and must be a non-empty string'
        });
      }

      const newServiceType = await this.serviceService.createServiceType({ name });

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
      const ServiceTypes = await this.serviceService.getAllServiceTypes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: ServiceTypes
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

      const ServiceType = await this.serviceService.getServiceTypeById(id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.FETCHED_SUCESS,
        data: ServiceType
      });
    } catch (error) {
      next(error);
    }
  };

  updateServiceType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type ID is required'
        });
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type name is required and must be a non-empty string'
        });
      }

      const updatedServiceType = await this.serviceService.updateServiceType(id, { name });

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
      const { isActive } = req.body;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Service type ID is required'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const updatedServiceType = await this.serviceService.updateServiceTypeStatus(id, isActive);

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