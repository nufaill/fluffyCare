import { Schema, model } from 'mongoose';
import { ServiceTypeDocument } from '../types/serviceType.type';

const serviceTypeSchema = new Schema<ServiceTypeDocument>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ServiceType = model<ServiceTypeDocument>('ServiceType', serviceTypeSchema);