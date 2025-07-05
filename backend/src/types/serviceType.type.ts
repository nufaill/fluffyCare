import { Types, Document } from 'mongoose';

export interface CreateServiceType {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface ServiceType {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceTypeDocument extends ServiceType, Document {
  _id: Types.ObjectId;
}