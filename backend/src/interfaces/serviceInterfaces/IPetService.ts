import { PetDocument } from "types/Pet.types";
import { PetTypeDocument } from "types/PetType.type";
import { CreatePetDTO, UpdatePetDTO } from "dto/pet.dto";

export interface IPetService {
  createPet(userId: string, petData: CreatePetDTO): Promise<PetDocument>;
  getPetById(petId: string): Promise<PetDocument | null>;
  updatePet(petId: string, userId: string, updateData: UpdatePetDTO): Promise<PetDocument | null>;
  getPetsByUserId(userId: string): Promise<PetDocument[]>;
  getAllPetTypes(): Promise<PetTypeDocument[]>;
}