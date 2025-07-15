import { Schema, model } from 'mongoose';
import { ServiceDocument } from '../types/Service.types';

const serviceSchema = new Schema<ServiceDocument>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    serviceTypeId: { type: Schema.Types.ObjectId, ref: 'ServiceType', required: true },
    petTypeIds: [{ type: Schema.Types.ObjectId, ref: 'PetType', required: true }], 
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false },
    durationHoure: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

export const Service = model<ServiceDocument>('Service', serviceSchema);