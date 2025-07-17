import { CreateServiceData, ServiceDocument } from '../../types/Service.types';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { PetTypeDocument } from '../../types/PetType.type';

export interface IServiceRepository {
  createService(serviceData: CreateServiceData): Promise<ServiceDocument>;
  getServicesByShopId(shopId: string): Promise<ServiceDocument[]>;
  getServiceById(serviceId: string): Promise<ServiceDocument | null>;
  updateService(serviceId: string, updateData: Partial<CreateServiceData>): Promise<ServiceDocument | null>;
  checkServiceNameExists(shopId: string, name: string, excludeServiceId?: string): Promise<boolean>;
  getServicesByshopIdAndType(shopId: string, serviceTypeId: string): Promise<ServiceDocument[]>;
  getAllServiceTypes(): Promise<ServiceTypeDocument[]>;
  getAllPetTypes(): Promise<PetTypeDocument[]>;
  getAllServices(filters: any): Promise<{ data: ServiceDocument[]; total: number }>;
  getServicesNearLocation(lat: number, lng: number, maxDistance?: number): Promise<ServiceDocument[]>;
}