import Useraxios from "@/api/user.axios";
import type { FilterOptions, PetService, ServiceType, PetType } from "@/types/service";

export class PetServiceService {
  async getAllServices(filters: FilterOptions): Promise<{ services: PetService[]; total: number }> {
    const params = new URLSearchParams();

    if (filters?.petType?.length) {
      const petTypes = await this.getPetTypes();
      const petTypeIds = petTypes
        .filter(pt => filters.petType.includes(pt.name))
        .map(pt => pt._id);
      params.append('petTypeIds', petTypeIds.join(','));
    }

    if (filters?.serviceType?.length) {
      const serviceTypes = await this.getServiceTypes();
      const serviceTypeIds = serviceTypes
        .filter(st => filters.serviceType.includes(st.name))
        .map(st => st._id);
      params.append('serviceTypeIds', serviceTypeIds.join(','));
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
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        params.append('lat', position.coords.latitude.toString());
        params.append('lng', position.coords.longitude.toString());
        params.append('nearMe', 'true');
      } catch (error) {
        console.error('Failed to get geolocation:', error);
        params.append('nearMe', 'true');
      }
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    if (filters?.page) {
      params.append('page', filters.page.toString());
    }

    if (filters?.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }

    const response = await Useraxios.get(`/services${params.toString() ? `?${params.toString()}` : ''}`);
    return {
      services: response.data.services || [],
      total: response.data.total || 0,
    };
  }

  async getServiceById(serviceId: string): Promise<PetService> {
    const response = await Useraxios.get(`/services/${serviceId}`);
    return response.data.data;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    const response = await Useraxios.get('/service-types');
    return response.data.data;
  }

  async getPetTypes(): Promise<PetType[]> {
    const response = await Useraxios.get('/pet-types');
    return response.data.data;
  }
}