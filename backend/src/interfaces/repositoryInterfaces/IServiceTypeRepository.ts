import { CreateServiceType, ServiceTypeDocument } from '../../types/serviceType.type';

export interface IServiceTypeRepository {
  createServiceType(serviceTypeData: Partial<CreateServiceType>): Promise<ServiceTypeDocument>;
  getAllServiceTypes(): Promise<ServiceTypeDocument[]>;
  getServiceTypeById(id: string): Promise<ServiceTypeDocument | null>;
  updateServiceType(id: string, updateData: Partial<CreateServiceType>): Promise<ServiceTypeDocument | null>;
  updateServiceTypeStatus(id: string, isActive: boolean): Promise<ServiceTypeDocument | null>;
  checkServiceTypeExists(name: string, excludeId?: string): Promise<boolean>;
}