import { Pet } from "types/Pet.types";

export interface IPetService {
  createPet(petData: Partial<Pet>): Promise<Pet>;
  getPetById(petId: string): Promise<Pet | null>;
  updatePet(petId: string, updateData: Partial<Pet>): Promise<Pet | null>;
  deletePet(petId: string): Promise<void>;
}