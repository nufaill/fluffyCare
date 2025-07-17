import { ServiceDocument } from '../../types/Service.types';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { PetTypeDocument } from '../../types/PetType.type';
import { CreateServiceDTO, UpdateServiceDTO, ServiceFiltersDTO } from '../../dto/service.dto';

export interface IServiceService {
  createService(shopId: string, serviceData: CreateServiceDTO): Promise<ServiceDocument>;
  getServiceByShopId(shopId: string): Promise<ServiceDocument[]>;
  getServiceById(serviceId: string): Promise<ServiceDocument>;
  getServiceByIdPublic(serviceId: string): Promise<ServiceDocument>;
  updateService(serviceId: string, shopId: string, updateData: UpdateServiceDTO): Promise<ServiceDocument>;
  getAllServiceTypes(): Promise<ServiceTypeDocument[]>;
  getAllPetTypes(): Promise<PetTypeDocument[]>;
  getAllServices(filters: ServiceFiltersDTO): Promise<{
    data: ServiceDocument[];
    total: number;
  }>;
}