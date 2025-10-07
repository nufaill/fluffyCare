import { ShopDocument, ShopAvailability, Verification, GeoLocation } from '../../types/Shop.types';

export interface ShopDTO {
  id: string;
  name: string;
  location: GeoLocation;
  shopAvailability?: ShopAvailability;
  isVerified: Verification;
  isActive: boolean;
}

export interface NearbyShopsQuery {
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  openNow?: boolean;
}

export interface INearbyShopsService {
  getNearbyShops(query: NearbyShopsQuery): Promise<ShopDTO[]>;
}