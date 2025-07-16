export interface ServiceType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PetType {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export interface ServiceType {
  _id: string;
  name: string;
}
export interface Service {
  _id: string;
  shopId: string;
  serviceTypeId: string;
  petTypeIds: string[]; 
  name: string;
  description: string;
  price: number;
  image?: string; 
  durationHour: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  serviceTypeId: string;
  petTypeIds: string[]; 
  price: number;
  image?: string;
  durationHour: number;
  isActive?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  serviceTypeId?: string;
  petTypeIds?: string[]; 
  price?: number;
  durationHour?: number;
  image?: string;
  isActive?: boolean;
}

export interface ServiceApiResponse {
  success: boolean;
  data: Service | Service[];
  message: string;
}

export interface ServiceTypeApiResponse {
  success: boolean;
  data: ServiceType[];
  message: string;
}