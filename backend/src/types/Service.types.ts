import { Types, Document } from 'mongoose';

export interface Service {
  id: string;
  shopId: string;
  serviceTypeId: string;
  petTypeId: string;
  name: string;
  description: string;
  price: number;
  durationHoure: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData extends Omit<Service, 'id' | 'createdAt' | 'updatedAt'> {}

export interface ServiceDocument extends Omit<Service, 'id' | 'shopId' | 'serviceTypeId' | 'petTypeId'>, Document {
  _id: Types.ObjectId;
  shopId: Types.ObjectId;
  serviceTypeId: Types.ObjectId;
  petTypeId: Types.ObjectId;
}
