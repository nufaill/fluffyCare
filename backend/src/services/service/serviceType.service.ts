import { ServiceTypeRepository } from '../../repositories/serviceType.repository';
import { CreateServiceTypeDTO, UpdateServiceTypeDTO, UpdateServiceTypeStatusDTO } from '../../dto/serviceType.dto';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { CustomError } from '../../util/CustomerError';

export class ServiceTypeService {
  private serviceTypeRepository: ServiceTypeRepository;

  constructor(serviceTypeRepository: ServiceTypeRepository) {
    this.serviceTypeRepository = serviceTypeRepository;
  }

  async createServiceType(serviceTypeData: CreateServiceTypeDTO): Promise<ServiceTypeDocument> {
    const { name } = serviceTypeData;

    const exists = await this.serviceTypeRepository.checkServiceTypeExists(name);
    if (exists) {
      throw new CustomError('Service type already exists', 400);
    }

    const newServiceType = await this.serviceTypeRepository.createServiceType({
      name: name.trim(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return newServiceType;
  }

  async getAllServiceTypes(): Promise<ServiceTypeDocument[]> {
    return await this.serviceTypeRepository.getAllServiceTypes();
  }

  async getServiceTypeById(id: string): Promise<ServiceTypeDocument> {
    const serviceType = await this.serviceTypeRepository.getServiceTypeById(id);
    if (!serviceType) {
      throw new CustomError('Service type not found', 404);
    }
    return serviceType;
  }

  async updateServiceType(id: string, updateData: UpdateServiceTypeDTO): Promise<ServiceTypeDocument> {
    const { name } = updateData;

    // Check if Service type exists
    const existingServiceType = await this.serviceTypeRepository.getServiceTypeById(id);
    if (!existingServiceType) {
      throw new CustomError('Service type not found', 404);
    }

    if (name && name.trim() !== existingServiceType.name) {
      const nameExists = await this.serviceTypeRepository.checkServiceTypeExists(name, id);
      if (nameExists) {
        throw new CustomError('Service type name already exists', 400);
      }
    }

    const updatedServiceType = await this.serviceTypeRepository.updateServiceType(id, {
      name: name.trim(),
      updatedAt: new Date()
    });

    if (!updatedServiceType) {
      throw new CustomError('Failed to update Service type', 500);
    }

    return updatedServiceType;
  }

  async updateServiceTypeStatus(id: string, statusData: UpdateServiceTypeStatusDTO): Promise<ServiceTypeDocument> {
    const { isActive } = statusData;

    const existingServiceType = await this.serviceTypeRepository.getServiceTypeById(id);
    if (!existingServiceType) {
      throw new CustomError('Service type not found', 404);
    }

    const updatedServiceType = await this.serviceTypeRepository.updateServiceTypeStatus(id, isActive);
    if (!updatedServiceType) {
      throw new CustomError('Failed to update Service type status', 500);
    }

    return updatedServiceType;
  }
}