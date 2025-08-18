import { GeoLocation, ShopAvailability } from "types/Shop.types";

export interface UpdateShopStatusDTO {
  isActive: boolean;
}

export interface UpdateShopDTO {
  name?: string;
  phone?: string;
  logo?: string;
   location?: GeoLocation;
  city?: string;
  streetAddress?: string;
  description?: string;
  subscription?: 'free' | 'basic' | 'premium';
}

export interface RejectShopDTO {
  rejectionReason?: string;
}

export interface ShopResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  streetAddress?: string;
  logo?: string;
  description?: string;
  certificateUrl?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  shopAvailability?: ShopAvailability;
  subscription?: 'free' | 'basic' | 'premium';
}

export interface ShopAvailabilityDTO extends ShopAvailability {
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  lunchBreak?: {
    start: string;
    end: string;
  };
  teaBreak?: {
    start: string;
    end: string;
  };
  customHolidays?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}