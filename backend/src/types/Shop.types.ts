// backend/src/types/Shop.types.ts
import { Document, Types } from 'mongoose';

export interface ShopLocation {
  lat?: number;
  lng?: number;
}

export interface CreateShopData {
  logo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string;
  description?: string;
  certificateUrl: string;
  location?: ShopLocation;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface ShopDocument extends Document {
  _id: Types.ObjectId;
  logo: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string;
  description?: string;
  certificateUrl: string;
  location?: ShopLocation;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo: string;
  city: string;
  streetAddress: string;
  buildingNumber?: string;
  description?: string;
  certificateUrl: string;
  location?: ShopLocation;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  buildingNumber?: string;
  description?: string;
  certificateUrl: string;
  location?: ShopLocation;
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