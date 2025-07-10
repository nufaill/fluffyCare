import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constant';
import { ServiceService } from '../../services/service/service.service';
import { CustomError } from '../../util/CustomerError';

export class ServiceController {
    private serviceService: ServiceService;

    constructor(serviceService: ServiceService) {
        this.serviceService = serviceService;
    }

    createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const shopId = req.shop?.shopId;
            if (!shopId) {
                throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
            }

            const serviceData = req.body;
            const newService = await this.serviceService.createService(shopId, serviceData);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: SUCCESS_MESSAGES.SERVICE_CREATED,
                data: newService
            });
        } catch (error) {
            next(error);
        }
    };

    getServicesByShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const shopId = req.shop?.shopId;
            if (!shopId) {
                throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
            }

            const services = await this.serviceService.getServiceByShopId(shopId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DATA_RETRIEVED,
                data: services
            });
        } catch (error) {
            next(error);
        }
    };

    getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const service = await this.serviceService.getServiceById(serviceId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DATA_RETRIEVED,
                data: service
            });
        } catch (error) {
            next(error);
        }
    };

  async getServiceByIdPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { serviceId } = req.params;
        console.log(`Fetching service with ID: ${serviceId}`);
        const service = await this.serviceService.getServiceByIdPublic(serviceId);
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

    updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const shopId = req.shop?.shopId;
            if (!shopId) {
                throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
            }

            const updateData = req.body;
            const updatedService = await this.serviceService.updateService(serviceId, shopId, updateData);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.SERVICE_UPDATED,
                data: updatedService
            });
        } catch (error) {
            next(error);
        }
    };

    toggleServiceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const shopId = req.shop?.shopId;
            if (!shopId) {
                throw new CustomError('Shop ID is required', HTTP_STATUS.UNAUTHORIZED);
            }

            const service = await this.serviceService.getServiceById(serviceId);
            if (service.shopId._id.toString() !== shopId) {
                throw new CustomError('Not authorized to update this service', HTTP_STATUS.FORBIDDEN);
            }

            const updatedService = await this.serviceService.updateService(serviceId, shopId, {
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
    };

    getServiceTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const serviceTypes = await this.serviceService.getAllServiceTypes();

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DATA_RETRIEVED,
                data: serviceTypes
            });
        } catch (error) {
            next(error);
        }
    };

    getPetTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const petTypes = await this.serviceService.getAllPetTypes();

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DATA_RETRIEVED,
                data: petTypes
            });
        } catch (error) {
            next(error);
        }
    };

    getAllServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const {
                petTypeIds,
                serviceTypeIds,
                minPrice,
                maxPrice,
                minDuration,
                maxDuration,
                minRating,
                nearMe,
                search,
                page = 1,
                pageSize = 9
            } = req.query;

            const filters: any = {
                page: parseInt(page as string),
                pageSize: parseInt(pageSize as string)
            };

            if (petTypeIds && typeof petTypeIds === 'string') {
                filters.petTypeIds = petTypeIds;
            }

            if (serviceTypeIds && typeof serviceTypeIds === 'string') {
                filters.serviceTypeIds = serviceTypeIds;
            }

            if (minPrice) filters.minPrice = parseFloat(minPrice as string);
            if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

            if (minDuration) filters.minDuration = parseInt(minDuration as string);
            if (maxDuration) filters.maxDuration = parseInt(maxDuration as string);

            if (minRating) filters.minRating = parseFloat(minRating as string);

            if (nearMe === 'true') {
                filters.nearMe = true;
                if (req.query.lat && req.query.lng) {
                    filters.lat = parseFloat(req.query.lat as string);
                    filters.lng = parseFloat(req.query.lng as string);
                }
            }

            if (search && typeof search === 'string') {
                filters.search = search.trim();
            }

            const services = await this.serviceService.getAllServices(filters);

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
    };
}