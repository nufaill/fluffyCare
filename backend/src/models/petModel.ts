import { Schema, model } from 'mongoose';
import { PetDocument } from '../types/Pet.types';

const petSchema = new Schema<PetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    petTypeId: { type: Schema.Types.ObjectId, ref: 'PetType', required: true },
    profileImage: { type: String, required: true },
    name: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    weight: { type: Number, required: true },
    additionalNotes: { type: String, default: '' },
    friendlyWithPets: { type: Boolean, default: false },
    friendlyWithOthers: { type: Boolean, default: false },
    trainedBefore: { type: Boolean, default: false },
    vaccinationStatus: { type: Boolean, default: false },
    medication: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Pet = model<PetDocument>('Pet', petSchema);
