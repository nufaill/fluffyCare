import { ServiceRepository } from '../../repositories/service.repository';
import { CreateServiceDTO, UpdateServiceDTO, ServiceFiltersDTO } from '../../dto/service.dto';
import { ServiceDocument } from '../../types/Service.types';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { PetTypeDocument } from '../../types/PetType.type';
import { CustomError } from '../../util/CustomerError';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from 'shared/constant';
import { IServiceService } from '../../interfaces/serviceInterfaces/IServiceService';

export class ServiceService implements IServiceService {
    private serviceRepository: ServiceRepository;

    constructor(serviceRepository: ServiceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async createService(shopId: string, serviceData: CreateServiceDTO): Promise<ServiceDocument> {
        const { name, serviceTypeId, petTypeIds, description, price, durationHour, isActive = true, rating = 0, image } = serviceData;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new CustomError('Service name is required and must be a non-empty string', 400);
        }
        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            throw new CustomError('Service description is required and must be a non-empty string', 400);
        }
        if (!price || typeof price !== 'number' || price <= 0) {
            throw new CustomError('Service price is required and must be a positive number', 400);
        }
        if (!durationHour || typeof durationHour !== 'number' || durationHour < 0) {
            throw new CustomError('Service duration hours is required and must be a positive number', 400);
        }
        if (!serviceTypeId || typeof serviceTypeId !== 'string') {
            throw new CustomError('Service type ID is required', 400);
        }
        if (!Array.isArray(petTypeIds) || petTypeIds.length === 0) {
            throw new CustomError('At least one pet type must be selected', 400);
        }

        const invalidIds = petTypeIds.filter(id => !/^[a-f\d]{24}$/i.test(id));
        if (invalidIds.length > 0) {
            throw new CustomError('One or more pet type IDs are invalid', 400);
        }

        const nameExists = await this.serviceRepository.checkServiceNameExists(shopId, name);
        if (nameExists) {
            throw new CustomError('Service name already exists for this shop', 400);
        }

        const newService = await this.serviceRepository.createService({
            shopId,
            name: name.trim(),
            description: description.trim(),
            price,
            durationHour,
            petTypeIds,
            serviceTypeId,
            isActive,
            rating,
            image,
        });
        return newService;
    }

    async getServiceByShopId(shopId: string): Promise<ServiceDocument[]> {
        return await this.serviceRepository.getServicesByShopId(shopId);
    }

    async getServiceById(serviceId: string): Promise<ServiceDocument> {
        const service = await this.serviceRepository.getServiceById(serviceId);
        if (!service) {
            throw new CustomError('Service not found', 404);
        }
        return service;
    }

    async getServiceByIdPublic(serviceId: string): Promise<ServiceDocument> {
        try {
            console.log(`ServiceService: Fetching service with ID: ${serviceId}`);
            const service = await this.serviceRepository.getServiceById(serviceId);
            if (!service) {
                console.log(`ServiceService: Service with ID ${serviceId} not found`);
                throw new CustomError('Service not found', 404);
            }
            if (!service.isActive) {
                console.log(`ServiceService: Service with ID ${serviceId} is inactive`);
                throw new CustomError('Service not found', 404);
            }
            return service;
        } catch (error: any) {
            console.error(`Error in getServiceByIdPublic [Service]: ${error.message}`, error);
            throw error;
        }
    }

    async updateService(serviceId: string, shopId: string, updateData: UpdateServiceDTO): Promise<ServiceDocument> {
        const existingService = await this.serviceRepository.getServiceById(serviceId);
        if (!existingService) {
            throw new CustomError('Service not found', 404);
        }
        if (existingService.shopId._id.toString() !== shopId) {
            throw new CustomError('Not authorized to update this Service', 403);
        }

        if (updateData.petTypeIds) {
            if (!Array.isArray(updateData.petTypeIds) || updateData.petTypeIds.length === 0) {
                throw new CustomError('At least one pet type must be selected', 400);
            }

            const invalidIds = updateData.petTypeIds.filter(id => !/^[a-f\d]{24}$/i.test(id));
            if (invalidIds.length > 0) {
                throw new CustomError('One or more pet type IDs are invalid', 400);
            }
        }

        if (updateData.name && updateData.name.trim() !== existingService.name) {
            const nameExists = await this.serviceRepository.checkServiceNameExists(shopId, updateData.name, serviceId);
            if (nameExists) {
                throw new CustomError('Service name already exists for this shop', 400);
            }
        }

        const updatedService = await this.serviceRepository.updateService(serviceId, {
            ...updateData,
            name: updateData.name?.trim(),
            description: updateData.description?.trim(),
        });

        if (!updatedService) {
            throw new CustomError('Failed to update Service', 500);
        }

        return updatedService;
    }

    async getAllServiceTypes(): Promise<ServiceTypeDocument[]> {
        return await this.serviceRepository.getAllServiceTypes();
    }

    async getAllPetTypes(): Promise<PetTypeDocument[]> {
        return await this.serviceRepository.getAllPetTypes();
    }

    async getAllServices(filters: ServiceFiltersDTO): Promise<{
        data: ServiceDocument[];
        total: number;
    }> {
        return await this.serviceRepository.getAllServices(filters);
    }
}