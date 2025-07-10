// pet.type.ts
export interface Pet {
  _id: string;
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

export interface UpdatePetPayload {
  profileImage?: string;
  name?: string;
  breed?: string;
  age?: number;
  gender?: 'Male' | 'Female';
  weight?: number;
  additionalNotes?: string;
  friendlyWithPets?: boolean;
  friendlyWithOthers?: boolean;
  trainedBefore?: boolean;
  vaccinationStatus?: boolean;
  medication?: string;
}

export interface PetDocument extends Pet {} 