export interface CreatePetDTO {
  petTypeId: string;
  profileImage: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: number;
  additionalNotes?: string;
  friendlyWithPets?: boolean;
  friendlyWithOthers?: boolean;
  trainedBefore?: boolean;
  vaccinationStatus?: boolean;
  medication?: string;
}

export interface UpdatePetDTO {
  petTypeId?: string;
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