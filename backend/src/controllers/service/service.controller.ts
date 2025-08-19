import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../../shared/constant';
import { IServiceService } from '../../interfaces/serviceInterfaces/IServiceService';
import { CustomError } from '../../util/CustomerError';
import { CreateServiceDTO, UpdateServiceDTO, ServiceFiltersDTO } from '../../dto/service.dto';
import { IServiceController } from '../../interfaces/controllerInterfaces/IServiceController';
import { Types } from 'mongoose';

export class ServiceController implements IServiceController {
  private _serviceService: IServiceService;

  constructor(serviceService: IServiceService) {
    this._serviceService = serviceService;
  }

  async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shopId = req.shop?.shopId;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
      }

      const serviceData: CreateServiceDTO = req.body;

      // Validate required fields
      if (!serviceData.name || typeof serviceData.name !== 'string' || serviceData.name.trim().length === 0) {
        throw new CustomError('Service name is required and must be a non-empty string', HTTP_STATUS.BAD_REQUEST);
      }
      if (!serviceData.serviceTypeId || typeof serviceData.serviceTypeId !== 'string') {
        throw new CustomError('Service type ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(serviceData.petTypeIds) || serviceData.petTypeIds.length === 0) {
        throw new CustomError('At least one pet type must be selected', HTTP_STATUS.BAD_REQUEST);
      }

      const newService = await this._serviceService.createService(shopId, serviceData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.SERVICE_CREATED,
        data: newService
      });
    } catch (error) {
      next(error);
    }
  }

  async getServicesByShop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shopId = req.shop?.shopId;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
      }

      const services = await this._serviceService.getServiceByShopId(shopId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: services
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      if (!serviceId) {
        throw new CustomError('Service ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const service = await this._serviceService.getServiceById(serviceId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceByIdPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      if (!serviceId) {
        throw new CustomError('Service ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      if (!Types.ObjectId.isValid(serviceId)) {
        throw new CustomError('Invalid Service ID format', HTTP_STATUS.BAD_REQUEST);
      }

      console.log(`Fetching service with ID: ${serviceId}`);
      const service = await this._serviceService.getServiceByIdPublic(serviceId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: service
      });
    } catch (error: any) {
      console.error(`Error in getServiceByIdPublic [Controller]: ${error.message}`, error);
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      const shopId = req.shop?.shopId;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
      }
      if (!serviceId) {
        throw new CustomError('Service ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const updateData: UpdateServiceDTO = req.body;

      const updatedService = await this._serviceService.updateService(serviceId, shopId, updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.SERVICE_UPDATED,
        data: updatedService
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleServiceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serviceId } = req.params;
      const shopId = req.shop?.shopId;
      if (!shopId) {
        throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
      }
      if (!serviceId) {
        throw new CustomError('Service ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const service = await this._serviceService.getServiceById(serviceId);
      if (service.shopId._id.toString() !== shopId) {
        throw new CustomError('Not authorized to update this service', HTTP_STATUS.FORBIDDEN);
      }

      const updatedService = await this._serviceService.updateService(serviceId, shopId, {
        isActive: !service.isActive
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.SERVICE_STATUS_UPDATED,
        data: updatedService
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const serviceTypes = await this._serviceService.getAllServiceTypes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: serviceTypes
      });
    } catch (error) {
      next(error);
    }
  }

  async getPetTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const petTypes = await this._serviceService.getAllPetTypes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: petTypes
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ServiceFiltersDTO = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 9,
        search: typeof req.query.search === 'string' && req.query.search.trim() ? req.query.search.trim() : undefined,
      };

      if (req.query.petTypeIds && typeof req.query.petTypeIds === 'string') {
        filters.petTypeIds = req.query.petTypeIds;
      }

      if (req.query.serviceTypeIds && typeof req.query.serviceTypeIds === 'string') {
        filters.serviceTypeIds = req.query.serviceTypeIds;
      }

      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);

      if (req.query.minDuration) filters.minDuration = parseInt(req.query.minDuration as string);
      if (req.query.maxDuration) filters.maxDuration = parseInt(req.query.maxDuration as string);

      if (req.query.minRating) filters.minRating = parseFloat(req.query.minRating as string);

      if (req.query.nearMe === 'true') {
        filters.nearMe = true;
        if (req.query.lat && req.query.lng) {
          filters.lat = parseFloat(req.query.lat as string);
          filters.lng = parseFloat(req.query.lng as string);
        }
      }

      const services = await this._serviceService.getAllServices(filters);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        services: services.data,
        total: services.total
      });
    } catch (error) {
      console.error('❌ getAllServices error:', error);
      next(error);
    }
  }
}