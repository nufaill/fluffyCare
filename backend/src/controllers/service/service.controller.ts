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

    getServiceByIdPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const service = await this.serviceService.getServiceByIdPublic(serviceId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DATA_RETRIEVED,
                data: service
            });
        } catch (error) {
            next(error);
        }
    };

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

    // FIXED: Add comprehensive debugging
    getAllServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('🚀 getAllServices called with query:', req.query);
            
            const { 
                petTypes, 
                serviceTypes, 
                minPrice, 
                maxPrice, 
                minDuration, 
                maxDuration, 
                minRating, 
                nearMe 
            } = req.query;

            const filters: any = {};
            
            if (petTypes) {
                const petTypeArray = typeof petTypes === 'string' ? petTypes.split(',') : petTypes;
                filters.petTypeIds = { $in: petTypeArray };
                console.log('🐾 Pet type filter:', petTypeArray);
            }
            
            if (serviceTypes) {
                const serviceTypeArray = typeof serviceTypes === 'string' ? serviceTypes.split(',') : serviceTypes;
                filters.serviceTypeId = { $in: serviceTypeArray };
                console.log('🔧 Service type filter:', serviceTypeArray);
            }
            
            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.$gte = parseFloat(minPrice as string);
                if (maxPrice) filters.price.$lte = parseFloat(maxPrice as string);
                console.log('💰 Price filter:', filters.price);
            }
            
            // FIXED: Handle both duration field names
            if (minDuration || maxDuration) {
                const durationFilter: any = {};
                if (minDuration) durationFilter.$gte = parseFloat(minDuration as string);
                if (maxDuration) durationFilter.$lte = parseFloat(maxDuration as string);
                
                // Use $or to handle both field names
                filters.$or = [
                    { duration: durationFilter },
                    { durationHoure: durationFilter }
                ];
                console.log('⏰ Duration filter:', durationFilter);
            }
            
            if (minRating) {
                filters.rating = { $gte: parseFloat(minRating as string) };
                console.log('⭐ Rating filter:', filters.rating);
            }

            filters.isActive = true;
            console.log('🔍 Final filters:', JSON.stringify(filters, null, 2));

            const services = await this.serviceService.getAllServices(filters);
            console.log('✅ Services retrieved:', services.length);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DATA_RETRIEVED,
                data: services
            });
        } catch (error) {
            console.error('❌ getAllServices error:', error);
            next(error);
        }
    };
}