import { Document, Types } from 'mongoose';

// GeoJSON location type
export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

//  Shop Create Data
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
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

//  Mongoose Shop Document
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
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Response Shape
export interface ShopProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  location: GeoLocation;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
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
