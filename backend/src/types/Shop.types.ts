import { Document, ObjectId } from 'mongoose';

export interface ShopLocation {
  lat?: number;
  lng?: number;
}

export interface CreateShopData {
  logo?: string;
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
  isActive?: boolean;
}

export interface Shop {
  logo?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopDocument extends Shop, Document {
  _id: ObjectId;
}
