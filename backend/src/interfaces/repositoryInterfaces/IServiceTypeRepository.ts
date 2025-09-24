import { FilterQuery, SortOrder } from 'mongoose';
import { ServiceTypeDocument, CreateServiceType } from '../../types/serviceType.type';

export interface IServiceTypeRepository {
    createServiceType(serviceTypeData: Partial<CreateServiceType>): Promise<ServiceTypeDocument>;
    getAllServiceTypes(filter?: FilterQuery<ServiceTypeDocument>, sort?: Record<string, SortOrder>): Promise<ServiceTypeDocument[]>;
    getServiceTypeById(id: string): Promise<ServiceTypeDocument | null>;
    updateServiceType(id: string, updateData: Partial<CreateServiceType>): Promise<ServiceTypeDocument | null>;
    updateServiceTypeStatus(id: string, isActive: boolean): Promise<ServiceTypeDocument | null>;
    checkServiceTypeExists(name: string, excludeId?: string): Promise<boolean>;
}