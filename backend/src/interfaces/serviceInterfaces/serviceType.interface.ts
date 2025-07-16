import { ServiceType } from 'types/serviceType.type';

export interface IServiceTypeService {
  createServiceType(serviceTypeData: Partial<ServiceType>): Promise<ServiceType>;
  getServiceTypeById(serviceTypeId: string): Promise<ServiceType | null>;
  updateServiceType(serviceTypeId: string, updateData: Partial<ServiceType>): Promise<ServiceType | null>;
}