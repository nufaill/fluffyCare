import { Types, Document } from 'mongoose';

export interface Pet {
  id: string;
  userId: string;
  petTypeId: string;
  profileImage: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: number;
  additionalNotes: string;
  friendlyWithPets: boolean;
  friendlyWithOthers: boolean;
  trainedBefore: boolean;
  vaccinationStatus: boolean;
  medication: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetData extends Omit<Pet, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PetDocument extends Omit<Pet, 'id' | 'userId'|'petTypeId'>, Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  petTypeId: Types.ObjectId;
}
