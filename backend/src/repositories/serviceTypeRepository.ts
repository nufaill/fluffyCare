import { Types } from 'mongoose';
import { ServiceType } from '../models/serviceTypeModel';
import { CreateServiceType, ServiceTypeDocument } from '../types/serviceType.type';

export class ServiceRepository {

    async createServiceType(serviceTypeData: Partial<CreateServiceType>): Promise<ServiceTypeDocument> {
        const serviceType = new ServiceType(serviceTypeData);
        return await serviceType.save();
    }

    async getAllServiceTypes(): Promise<ServiceTypeDocument[]> {
        return await ServiceType.find().sort({ createdAt: -1 });
    }

    async getServiceTypeById(id: string): Promise<ServiceTypeDocument | null> {
        return await ServiceType.findById(id);
    }

    async updateServiceType(id: string, updateData: Partial<CreateServiceType>): Promise<ServiceTypeDocument | null> {
        return await ServiceType.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateServiceTypeStatus(id: string, isActive: boolean): Promise<ServiceTypeDocument | null> {
        return await ServiceType.findByIdAndUpdate(id, { isActive }, { new: true });
    }

    async checkServiceTypeExists(name: string, excludeId?: string): Promise<boolean> {
        const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existingServiceType = await ServiceType.findOne(query);
        return !!existingServiceType;
    }
}