import { Types,Document, ObjectId } from 'mongoose';

export interface CreateUserData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location?: Record<string, any>;   
  isActive?: boolean;               
  isGoogleUser?: boolean;
  googleId?: string;
}

export interface User {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location?: Record<string, any>;
  isActive: boolean;
  isGoogleUser?: boolean;
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User, Document {
  _id: Types.ObjectId;
}