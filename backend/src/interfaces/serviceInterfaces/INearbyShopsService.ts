export interface NearbyShopsQuery {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  serviceType?: string;
  petType?: string;
}

export interface NearbyShop {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address: string; // This will map to streetAddress
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isActive: boolean;
  isVerified: boolean;
  distance: number;
  profileImage?: string; // This will map to logo
  description?: string;
}