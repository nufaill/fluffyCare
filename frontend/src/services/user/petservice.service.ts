import Useraxios from "@/api/user.axios";
import type { FilterOptions, PetService, ServiceType, PetType } from "@/types/service";

export class PetServiceService {
  async getAllServices(filters: FilterOptions): Promise<{ services: PetService[]; total: number }> {
    const params = new URLSearchParams();

    // Map pet type names to IDs
    if (filters?.petType?.length) {
      const petTypes = await this.getPetTypes();
      const petTypeIds = petTypes
        .filter(pt => filters.petType.includes(pt.name.toLowerCase()))
        .map(pt => pt._id);
      if (petTypeIds.length > 0) {
        params.append('petTypeIds', petTypeIds.join(','));
      }
    }

    // Map service type names to IDs
    if (filters?.serviceType?.length) {
      const serviceTypes = await this.getServiceTypes();
      const serviceTypeIds = serviceTypes
        .filter(st => filters.serviceType.includes(st.name.toLowerCase()))
        .map(st => st._id);
      if (serviceTypeIds.length > 0) {
        params.append('serviceTypeIds', serviceTypeIds.join(','));
      }
    }

    // Price range
    if (filters?.priceRange && filters.priceRange.length === 2) {
      if (filters.priceRange[0] > 0) {
        params.append('minPrice', filters.priceRange[0].toString());
      }
      if (filters.priceRange[1] < 20000) {
        params.append('maxPrice', filters.priceRange[1].toString());
      }
    }

    // Duration range
    if (filters?.duration && filters.duration.length === 2) {
      if (filters.duration[0] > 0) {
        params.append('minDuration', filters.duration[0].toString());
      }
      if (filters.duration[1] < 24) {
        params.append('maxDuration', filters.duration[1].toString());
      }
    }

    // Rating filter
    if (filters?.rating && filters.rating > 0) {
      params.append('minRating', filters.rating.toString());
    }

    // Location filter
    if (filters?.nearMe) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });
        params.append('lat', position.coords.latitude.toString());
        params.append('lng', position.coords.longitude.toString());
        params.append('nearMe', 'true');
      } catch (error) {
        console.error('Geolocation error:', error);
        // Still set nearMe to true but without coordinates
        params.append('nearMe', 'true');
      }
    }

    // Search filter
    if (filters?.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    // Pagination
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