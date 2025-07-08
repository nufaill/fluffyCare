export interface PetService {
  id: string;
  serviceName: string;
  description: string;
  price: number;
  serviceImage: string;
  duration: number;
  rating: number;
  reviewCount: number;
  shopName: string;
  shopLogo: string;
  location: {
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  serviceType: string;
  petTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  petType: string[];
  serviceType: string[];
  priceRange: [number, number];
  duration: [number, number];
  rating: number;
  nearMe: boolean;
}