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
  createdAt?: Date;
  updatedAt?: Date;
}