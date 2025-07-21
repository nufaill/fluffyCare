import { Schema, model } from 'mongoose';
import { PetTypeDocument } from '../types/PetType.type';

const PetTypeSchema = new Schema<PetTypeDocument>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PetType = model<PetTypeDocument>('PetType', PetTypeSchema);