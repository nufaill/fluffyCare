// service.interface.ts
import { Service } from 'types/Service.types';

export interface IServiceService {
  createService(serviceData: Partial<Service>): Promise<Service>;
  getServiceById(serviceId: string): Promise<Service | null>;
  updateService(serviceId: string, updateData: Partial<Service>): Promise<Service | null>;
}