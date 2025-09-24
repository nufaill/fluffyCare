import { FilterQuery, SortOrder } from 'mongoose';
import { IServiceTypeRepository } from '../../interfaces/repositoryInterfaces/IServiceTypeRepository';
import { CreateServiceTypeDTO, UpdateServiceTypeDTO, UpdateServiceTypeStatusDTO } from '../../dto/serviceType.dto';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { CustomError } from '../../util/CustomerError';
import { IServiceTypeService } from '../../interfaces/serviceInterfaces/IServiceTypeService';

export class ServiceTypeService implements IServiceTypeService {
    private readonly _repository: IServiceTypeRepository;

    constructor(repository: IServiceTypeRepository) {
        this._repository = repository;
    }

    async createServiceType(serviceTypeData: CreateServiceTypeDTO): Promise<ServiceTypeDocument> {
        const { name } = serviceTypeData;

        const exists = await this._repository.checkServiceTypeExists(name);
        if (exists) {
            throw new CustomError('Service type already exists', 400);
        }

        const newServiceType = await this._repository.createServiceType({
            name: name.trim(),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return newServiceType;
    }

    async getAllServiceTypes(options: { filter?: FilterQuery<ServiceTypeDocument>; sort?: Record<string, SortOrder> } = {}): Promise<ServiceTypeDocument[]> {
        return await this._repository.getAllServiceTypes(options.filter, options.sort);
    }

    async getServiceTypeById(id: string): Promise<ServiceTypeDocument> {
        const serviceType = await this._repository.getServiceTypeById(id);
        if (!serviceType) {
            throw new CustomError('Service type not found', 404);
        }
        return serviceType;
    }

    async updateServiceType(id: string, updateData: UpdateServiceTypeDTO): Promise<ServiceTypeDocument> {
        const { name } = updateData;

        const existingServiceType = await this._repository.getServiceTypeById(id);
        if (!existingServiceType) {
            throw new CustomError('Service type not found', 404);
        }

        if (name && name.trim() !== existingServiceType.name) {
            const nameExists = await this._repository.checkServiceTypeExists(name, id);
            if (nameExists) {
                throw new CustomError('Service type name already exists', 400);
            }
        }

        const updatedServiceType = await this._repository.updateServiceType(id, {
            name: name?.trim(),
            updatedAt: new Date()
        });

        if (!updatedServiceType) {
            throw new CustomError('Failed to update Service type', 500);
        }

        return updatedServiceType;
    }

    async updateServiceTypeStatus(id: string, statusData: UpdateServiceTypeStatusDTO): Promise<ServiceTypeDocument> {
        const { isActive } = statusData;

        const existingServiceType = await this._repository.getServiceTypeById(id);
        if (!existingServiceType) {
            throw new CustomError('Service type not found', 404);
        }

        const updatedServiceType = await this._repository.updateServiceTypeStatus(id, isActive);
        if (!updatedServiceType) {
            throw new CustomError('Failed to update Service type status', 500);
        }

        return updatedServiceType;
    }
}