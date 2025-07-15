import { PetType } from "types/PetType.type";

export interface IPetTypeService {
  createPetType(petTypeData: Partial<PetType>): Promise<PetType>;
  getPetTypeById(petTypeId: string): Promise<PetType | null>;
  updatePetType(petTypeId: string, updateData: Partial<PetType>): Promise<PetType | null>;
  deletePetType(petTypeId: string): Promise<void>;
}