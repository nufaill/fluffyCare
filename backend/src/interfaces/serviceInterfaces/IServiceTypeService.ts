import { FilterQuery, SortOrder } from 'mongoose';
import { ServiceTypeDocument } from '../../types/serviceType.type';
import { CreateServiceTypeDTO, UpdateServiceTypeDTO, UpdateServiceTypeStatusDTO } from '../../dto/serviceType.dto';

export interface IServiceTypeService {
    createServiceType(serviceTypeData: CreateServiceTypeDTO): Promise<ServiceTypeDocument>;
    getAllServiceTypes(options?: { filter?: FilterQuery<ServiceTypeDocument>; sort?: Record<string, SortOrder> }): Promise<ServiceTypeDocument[]>;
    getServiceTypeById(id: string): Promise<ServiceTypeDocument>;
    updateServiceType(id: string, updateData: UpdateServiceTypeDTO): Promise<ServiceTypeDocument>;
    updateServiceTypeStatus(id: string, statusData: UpdateServiceTypeStatusDTO): Promise<ServiceTypeDocument>;
}