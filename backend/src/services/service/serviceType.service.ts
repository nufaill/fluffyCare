import { ServiceTypeRepository } from '../../repositories/serviceTypeRepository';
import { CreateServiceType, ServiceTypeDocument } from '../../types/serviceType.type';
import { CustomError } from '../../util/CustomerError';

export class ServiceTypeService {
  private serviceTypeRepository: ServiceTypeRepository;

  constructor(serviceTypeRepository: ServiceTypeRepository) {
    this.serviceTypeRepository = serviceTypeRepository;
  }

  async createServiceType(ServiceTypeData: { name: string }): Promise<ServiceTypeDocument> {
    const { name } = ServiceTypeData;

    // Check if Service type already exists
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
    const ServiceType = await this.serviceTypeRepository.getServiceTypeById(id);
    if (!ServiceType) {
      throw new CustomError('Service type not found', 404);
    }
    return ServiceType;
  }

  async updateServiceType(id: string, updateData: { name: string }): Promise<ServiceTypeDocument> {
    const { name } = updateData;

    // Check if Service type exists
    const existingServiceType = await this.serviceTypeRepository.getServiceTypeById(id);
    if (!existingServiceType) {
      throw new CustomError('Service type not found', 404);
    }

    // Check if name is being changed and if new name already exists
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

  async updateServiceTypeStatus(id: string, isActive: boolean): Promise<ServiceTypeDocument> {
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