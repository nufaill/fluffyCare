import { GeoLocation } from '../dtos/user.dto';
import { Types } from 'mongoose';

export interface IUser {
  _id: string | Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  profileImage?: string;
  location?: GeoLocation;
  googleId?: string;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}