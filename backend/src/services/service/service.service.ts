import { ServiceRepository } from '../../repositories/serviceRepository';
import { CreateServiceData, ServiceDocument } from '../../types/Service.types';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { PetTypeDocument } from '../../types/PetType.type';
import { CustomError } from '../../util/CustomerError';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from 'shared/constant';

export class ServiceService {
    private serviceRepository: ServiceRepository;

    constructor(serviceRepository: ServiceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async createService(shopId: string, serviceData: Omit<CreateServiceData, 'shopId'>): Promise<ServiceDocument> {
        const { name, serviceTypeId, petTypeIds } = serviceData;


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
            ...serviceData,
            shopId,
            name: name.trim(),
        });
        return newService;
    }

    async getServiceByShopId(shopId: string): Promise<ServiceDocument[]> {
        return await this.serviceRepository.getServicesByShopId(shopId)
    }

    async getServiceById(serviceId: string): Promise<ServiceDocument> {
        const service = await this.serviceRepository.getServiceById(serviceId);
        if (!service) {
            throw new CustomError('Service not found', 404);
        }
        return service;
    }

    async updateService(ServiceId: string, shopId: string, updateData: Partial<Omit<CreateServiceData, 'shopId'>>): Promise<ServiceDocument> {
        const existingService = await this.serviceRepository.getServiceById(ServiceId);
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
            const nameExists = await this.serviceRepository.checkServiceNameExists(shopId, updateData.name, ServiceId);
            if (nameExists) {
                throw new CustomError('Service name already exists for this shop', 400);
            }
        }

        const updatedService = await this.serviceRepository.updateService(ServiceId, {
            ...updateData,
            name: updateData.name?.trim(),
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
        } catch (error:any) {
            console.error(`Error in getServiceByIdPublic [Service]: ${error.message}`, error);
            throw error;
        }
    }
    async getAllServices(filters: any = {}): Promise<{
        data: ServiceDocument[];
        total: number;
    }> {
        return await this.serviceRepository.getAllServices(filters);
    }
}