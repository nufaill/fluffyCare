import { Service } from "../models/Service.model";
import { CreateServiceData, ServiceDocument } from "../types/Service.types";
import { ServiceType } from '../models/serviceTypeModel';
import { PetType } from '../models/petTypeModel'; 
import { CreateServiceType, ServiceTypeDocument } from '../types/serviceType.type';
import { PetTypeDocument } from '../types/PetType.type'; 
import { Types } from "mongoose";

export class ServiceRepository {
    async createService(serviceData: CreateServiceData): Promise<ServiceDocument> {
        const service = new Service(serviceData);
        return await service.save();
    }
    
    async getServicesByShopId(shopId: string): Promise<ServiceDocument[]> {
        return await Service.find({ shopId: new Types.ObjectId(shopId) })
            .populate('serviceTypeId', 'name')
            .populate('petTypeIds', 'name') 
            .sort({ createdAt: -1 })
    }
    
    async getServiceById(serviceId: string): Promise<ServiceDocument | null> {
        return await Service.findById(serviceId)
            .populate('serviceTypeId', 'name')
            .populate('petTypeIds', 'name') 
            .populate('shopId', 'name email');
    }
    
    async updateService(serviceId: string, updateData: Partial<CreateServiceData>): Promise<ServiceDocument | null> {
        return await Service.findByIdAndUpdate(serviceId, updateData, { new: true })
            .populate('serviceTypeId', 'name')
            .populate('petTypeIds', 'name'); 
    }
    
    async checkServiceNameExists(shopId: string, name: string, excludeServiceId?: string): Promise<boolean> {
        const query: any = {
            shopId: new Types.ObjectId(shopId),
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        };
        if (excludeServiceId) {
            query._id = { $ne: excludeServiceId };
        }
        const existingService = await Service.findOne(query);
        return !!existingService;
    }
    
    async getServicesByshopIdAndType(shopId: string, serviceTypeId: string): Promise<ServiceDocument[]> {
        return await Service.find({
          shopId: new Types.ObjectId(shopId),
          serviceTypeId: new Types.ObjectId(serviceTypeId)
        });
    }
    
    async getAllServiceTypes(): Promise<ServiceTypeDocument[]> {
        return await ServiceType.find().sort({ createdAt: -1 });
    }
    
    async getAllPetTypes(): Promise<PetTypeDocument[]> {
        return await PetType.find().sort({ createdAt: -1 });
    }
}