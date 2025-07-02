// types/Shop.types.ts
import { Document } from 'mongoose';

export interface ShopDocument extends Document {
  logo?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  description?: string;
  certificateUrl: string;
  isActive?: boolean;
  isVerified?: boolean; 
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}
