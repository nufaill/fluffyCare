import { Service } from "../models/Service.model";
import { CreateServiceData, ServiceDocument } from "../types/Service.types";
import { ServiceType } from '../models/serviceTypeModel';
import { PetType } from '../models/petTypeModel';
import { ServiceTypeDocument } from '../types/serviceType.type';
import { PetTypeDocument } from '../types/PetType.type';
import { Types } from "mongoose";
import { IServiceRepository } from '../interfaces/repositoryInterfaces/IServiceRepository';

export class ServiceRepository implements IServiceRepository {
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
    try {
      console.log(`ServiceRepository: Querying service with ID: ${serviceId}`);
      const service = await Service.findById(serviceId)
        .populate('serviceTypeId', 'name')
        .populate('petTypeIds', 'name')
        .populate('shopId', 'name email logo phone city streetAddress location');
      if (!service) {
        console.log(`ServiceRepository: No service found for ID: ${serviceId}`);
      }
      return service;
    } catch (error:any) {
      console.error(`Error in getServiceById [Repository]: ${error.message}`, error);
      throw error;
    }
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
    return await ServiceType.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async getAllPetTypes(): Promise<PetTypeDocument[]> {
    return await PetType.find({ isActive: true }).sort({ createdAt: -1 });
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
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }

      if (filters.minDuration || filters.maxDuration) {
        const durationFilter: any = {};
        if (filters.minDuration) durationFilter.$gte = filters.minDuration;
        if (filters.maxDuration) durationFilter.$lte = filters.maxDuration;

        query.$or = [
          { duration: durationFilter },
          { durationHour: durationFilter }
        ];
      }

      if (filters.minRating) {
        query.rating = { $gte: filters.minRating };
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.nearMe && filters.lat && filters.lng) {
        const maxDistance = 10000;
        query['shopId.location'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [filters.lng, filters.lat]
            },
            $maxDistance: maxDistance
          }
        };
      }

      const page = filters.page || 1;
      const pageSize = filters.pageSize || 9;
      const skip = (page - 1) * pageSize;

      const [services, total] = await Promise.all([
        Service.find(query)
          .populate('serviceTypeId', 'name')
          .populate('petTypeIds', 'name')
          .populate('shopId', 'name email logo phone city streetAddress location')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize),
        Service.countDocuments(query)
      ]);

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