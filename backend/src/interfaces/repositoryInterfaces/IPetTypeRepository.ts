import { CreatePetType, PetTypeDocument } from '../../types/PetType.type';

export interface IPetTypeRepository {
  createPetType(petTypeData: Partial<CreatePetType>): Promise<PetTypeDocument>;
  getAllPetTypes(filter?: string): Promise<PetTypeDocument[]>;
  getPetTypeById(id: string): Promise<PetTypeDocument | null>;
  updatePetType(id: string, updateData: Partial<CreatePetType>): Promise<PetTypeDocument | null>;
  updatePetTypeStatus(id: string, isActive: boolean): Promise<PetTypeDocument | null>;
  checkPetTypeExists(name: string, excludeId?: string): Promise<boolean>;
}