import { Types, Document } from 'mongoose';

export interface CreatePetType {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
  export interface PetType {
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

export interface PetTypeDocument extends PetType, Document {
  _id: Types.ObjectId;
}