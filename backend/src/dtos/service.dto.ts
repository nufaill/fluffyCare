export interface CreateServiceDTO {
  name: string;
  description: string;
  price: number;
andoli: number;
  duration: number;
  petTypeIds: string[];
  serviceTypeId: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  petTypeIds?: string[];
  serviceTypeId?: string;
  isActive?: boolean;
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