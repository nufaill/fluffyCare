export interface Shop {
  _id: string;
  name: string;
  email?: string;
  logo?: string;
  phone?: string;
  city?: string;
  streetAddress?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface ServiceType {
  _id: string;
  name: string;
}

export interface PetType {
  _id: string;
  name: string;
}

export interface PetService {
  _id: string;
  shopId: Shop;
  serviceTypeId: ServiceType;
  petTypeIds: PetType[];
  name: string;
  description: string;
  price: number;
  image: string;
  durationHoure: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location?: {
    city: string;
    state: string;
  };
  rating?: number;
  reviewCount: number;
  reviews: string;
}

export interface FilterOptions {
  petType: string[];
  serviceType: string[];
  priceRange: [number, number];
  duration: [number, number];
  rating: number;
  nearMe: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}