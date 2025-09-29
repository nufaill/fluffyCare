import { GeoLocation, ShopAvailability } from "types/Shop.types";

export interface UpdateShopStatusDTO {
  isActive: boolean;
}

export type Verification = {
  status: "pending" | "approved" | "rejected";
  reason: string | null;
};

export interface IShopSubscription {
  subscriptionId: object | string | null;
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  isActive: boolean;
  plan?: string;
}

export interface UpdateShopDTO {
  certificateUrl?: string;
  name?: string;
  phone?: string;
  logo?: string;
  location?: GeoLocation;
  city?: string;
  streetAddress?: string;
  description?: string;
  subscription?: IShopSubscription;
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
  isVerified: Verification;
  shopAvailability?: ShopAvailability;
  subscription?: IShopSubscription;
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