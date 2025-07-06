import { Schema, model } from 'mongoose';
import { ServiceDocument } from '../types/Service.types';

const serviceSchema = new Schema<ServiceDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    serviceTypeId: { type: Schema.Types.ObjectId, ref: 'ServiceType', required: true },
    petTypeId: { type: Schema.Types.ObjectId, ref: 'PetType', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    durationHoure: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Service = model<ServiceDocument>('Service', serviceSchema);
