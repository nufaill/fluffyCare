// User.types.ts
import { Types, Document } from 'mongoose';

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface CreateUserData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location: GeoLocation;
  isActive?: boolean;
  isGoogleUser?: boolean;
  googleId?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location: GeoLocation;
  isActive: boolean;
  isGoogleUser?: boolean;
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Omit<User, '_id'>, Document {
  _id: Types.ObjectId;
}