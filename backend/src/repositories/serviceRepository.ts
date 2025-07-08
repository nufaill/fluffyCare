import { Service } from "../models/Service.model";
import { CreateServiceData, ServiceDocument } from "../types/Service.types";
import { ServiceType } from '../models/serviceTypeModel';
import { PetType } from '../models/petTypeModel';
import { ServiceTypeDocument } from '../types/serviceType.type';
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
      .sort({ createdAt: -1 });
  }

  async getServiceById(serviceId: string): Promise<ServiceDocument | null> {
    return await Service.findById(serviceId)
      .populate('serviceTypeId', 'name')
      .populate('petTypeIds', 'name')
      .populate('shopId', 'name email logo phone city streetAddress location');
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
  
    return await ServiceType.find({isActive:true}).sort({ createdAt: -1 });
  }

  async getAllPetTypes(): Promise<PetTypeDocument[]> {
    return await PetType.find({isActive:true}).sort({ createdAt: -1 });
  }

  async getAllServices(filters: any = {}): Promise<{ data: ServiceDocument[]; total: number }> {

    try {
      const query: any = { isActive: true };

      if (filters.petTypeIds) {
        const petTypeIds = filters.petTypeIds.split(',').map((id: string) => new Types.ObjectId(id.trim()));
        query.petTypeIds = { $in: petTypeIds };
      }

      if (filters.serviceTypeIds) {
        const serviceTypeIds = filters.serviceTypeIds.split(',').map((id: string) => new Types.ObjectId(id.trim()));
        query.serviceTypeId = { $in: serviceTypeIds };
      }

      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
      }

      if (filters.minDuration || filters.maxDuration) {
        query.durationHoure = {};
        if (filters.minDuration) query.durationHoure.$gte = parseInt(filters.minDuration);
        if (filters.maxDuration) query.durationHoure.$lte = parseInt(filters.maxDuration);
      }

      if (filters.minRating) {
        query.rating = { $gte: parseFloat(filters.minRating) };
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { 'shopId.name': { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.nearMe && filters.lat && filters.lng) {
        const maxDistance = 10000; // Default max distance in meters
        query['shopId.location'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(filters.lng), parseFloat(filters.lat)]
            },
            $maxDistance: maxDistance
          }
        };
      }

      const page = parseInt(filters.page) || 1;
      const pageSize = parseInt(filters.pageSize) || 9;
      const skip = (page - 1) * pageSize;

      const [services, total] = await Promise.all([
        Service.find(query)
          .populate('serviceTypeId', 'name')
          .populate('petTypeIds', 'name')
          .populate('shopId', 'name email logo phone city streetAddress location')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize),
        Service.countDocuments(query),
      ]);

      console.log(`Found ${services.length} services, total: ${total}`);
      return { data: services, total };
    } catch (error) {
      console.error('❌ Repository error:', error);
      throw error;
    }
  }

  async getServicesNearLocation(lat: number, lng: number, maxDistance: number = 10000): Promise<ServiceDocument[]> {
    return await Service.find({
      isActive: true,
      'shopId.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    })
      .populate('serviceTypeId', 'name')
      .populate('petTypeIds', 'name')
      .populate('shopId', 'name email logo phone city streetAddress location')
      .sort({ createdAt: -1 });
  }
}