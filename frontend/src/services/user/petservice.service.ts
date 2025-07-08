// services/petservice.service.ts
import Useraxios from "@/api/user.axios";
import type { FilterOptions, PetService } from "@/types/service";

export class PetServiceService {
  async getAllServices(filters?: FilterOptions): Promise<PetService[]> {
    const params = new URLSearchParams();
    
    if (filters?.petType?.length) {
      params.append('petTypes', filters.petType.join(','));
    }
    if (filters?.serviceType?.length) {
      params.append('serviceTypes', filters.serviceType.join(','));
    }
    if (filters?.priceRange) {
      params.append('minPrice', filters.priceRange[0].toString());
      params.append('maxPrice', filters.priceRange[1].toString());
    }
    if (filters?.duration) {
      params.append('minDuration', filters.duration[0].toString());
      params.append('maxDuration', filters.duration[1].toString());
    }
    if (filters?.rating) {
      params.append('minRating', filters.rating.toString());
    }
    if (filters?.nearMe) {
      params.append('nearMe', 'true');
    }

    const response = await Useraxios.get(`/services${params.toString() ? `?${params.toString()}` : ''}`);
    console.log("response1 : ",response)
    return response.data.data;
  }

  async getServiceById(serviceId: string): Promise<PetService> {
    const response = await Useraxios.get(`/services/${serviceId}`);
        console.log("response2 : ",response)
    return response.data.data;
  }

  async getServiceTypes() {
    const response = await Useraxios.get('/service-types');
        console.log("response3 : ",response)
    return response.data.data;
  }

  async getPetTypes() {
    const response = await Useraxios.get('/pet-types');
        console.log("response4 : ",response)
    return response.data.data;
  }
}