import { Schema, Document } from 'mongoose';

export interface Staff extends Document {
    _id: string;
    shopId: Schema.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}