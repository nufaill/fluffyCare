import { Document, Types } from 'mongoose';

// GeoJSON location type
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

type VerificationStatus = "pending" | "approved" | "rejected";

interface Verification {
  status: VerificationStatus;
  reason?: string | null;
}

export interface IShopSubscription {
  subscriptionId: Types.ObjectId | null;
  subscriptionStart: Date | null;
  subscriptionEnd: Date | null;
  isActive: boolean;
  plan: string;
}

// Shop Availability
export interface ShopAvailability {
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  lunchBreak?: {
    start?: string;
    end?: string;
  };
  teaBreak?: {
    start?: string;
    end?: string;
  };
  customHolidays?: string[];
}

// Shop Create Data
export interface CreateShopData {
  logo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  location: GeoLocation;
  isActive: boolean;
  isVerified: Verification;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  shopAvailability?: ShopAvailability;
}

// Mongoose Shop Document
export interface ShopDocument extends Document {
  _id: Types.ObjectId;
  logo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  location: GeoLocation;
  isActive: boolean;
  isVerified: Verification;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  shopAvailability?: ShopAvailability;
  subscription: IShopSubscription;
  createdAt: Date;
  updatedAt: Date;
}

// Response Shape
export interface ShopProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo?: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  location: GeoLocation;
  isActive: boolean;
  isVerified: Verification;
  createdAt: Date;
  updatedAt: Date;
  shopAvailability?: ShopAvailability;
}

// Auth Types
export interface ShopLoginData {
  email: string;
  password: string;
}

export interface ShopRegisterData {
  logo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  location: GeoLocation;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ShopAuthResponse {
  success: boolean;
  shop: ShopProfile;
  tokens: TokenPair;
}

export interface ShopVerificationResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  isActive: boolean;
  isVerified: Verification;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopRejectionData {
  rejectionReason?: string;
}

export interface Shop {
  logo?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  isActive: boolean;
  isVerified: Verification;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  shopAvailability?: ShopAvailability;
}

export interface ShopDocument extends Shop, Document {
  _id: Types.ObjectId;
}