import { ServiceType } from '../models/serviceType.model';
import { CreateServiceType, ServiceTypeDocument } from '../types/serviceType.type';
import { IServiceTypeRepository } from '../interfaces/repositoryInterfaces/IServiceTypeRepository';

export class ServiceTypeRepository implements IServiceTypeRepository {
    private _model: typeof ServiceType;

    constructor(model: typeof ServiceType = ServiceType) {
        this._model = model;
    }

    async createServiceType(serviceTypeData: Partial<CreateServiceType>): Promise<ServiceTypeDocument> {
        const serviceType = new this._model(serviceTypeData);
        return await serviceType.save();
    }

    async getAllServiceTypes(): Promise<ServiceTypeDocument[]> {
        return await this._model.find().sort({ createdAt: -1 });
    }

    async getServiceTypeById(id: string): Promise<ServiceTypeDocument | null> {
        return await this._model.findById(id);
    }

    async updateServiceType(id: string, updateData: Partial<CreateServiceType>): Promise<ServiceTypeDocument | null> {
        return await this._model.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateServiceTypeStatus(id: string, isActive: boolean): Promise<ServiceTypeDocument | null> {
        return await this._model.findByIdAndUpdate(id, { isActive }, { new: true });
    }

    async checkServiceTypeExists(name: string, excludeId?: string): Promise<boolean> {
        const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const existingServiceType = await this._model.findOne(query);
        return !!existingServiceType;
    }
}