export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
  durationHour: number; 
  petTypeIds: string[];
  serviceTypeId: string;
  image?: string;
  isActive?: boolean; 
  rating?: number; 
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  durationHour?: number; 
  petTypeIds?: string[];
  serviceTypeId?: string;
  image?: string; 
  isActive?: boolean;
  rating?: number;
}

export interface ServiceFiltersDTO {
  petTypeIds?: string;
  serviceTypeIds?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  nearMe?: boolean;
  lat?: number;
  lng?: number;
  search?: string;
  page: number;
  pageSize: number;
}