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
  durationHour: number;
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


export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface ServiceLocation {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address: string; // Maps to streetAddress from backend
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  isVerified: boolean;
  distance: number; // In meters
  profileImage?: string; // Maps to logo from backend
  description?: string;
  serviceType?: string; // Optional, for compatibility with existing ServiceMap
  rating?: number; // Optional, for compatibility
  price?: number; // Optional, for compatibility
}



export interface FilterOptions {
  petType: string[];
  serviceType: string[];
  priceRange: [number, number];
  duration: [number, number];
  rating: number;
  nearMe: boolean;
  search: string;
  page?: number;
  pageSize?: number;
}

export interface ServiceType {
  _id: string;
  name: string;
}

export interface PetType {
  _id: string;
  name: string;
}