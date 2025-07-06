import { PetTypeRepository } from '../../repositories/petTypeRepository';
import { PetTypeDocument } from '../../types/PetType.type';
import { CreatePetData, PetDocument } from '../../types/Pet.types';
import { CustomError } from '../../util/CustomerError';

export class PetTypeService {
  getPetById(petId: string) {
    throw new Error('Method not implemented.');
  }
  updatePet(petId: string, userId: string, updateData: any) {
    throw new Error('Method not implemented.');
  }
  private petRepository: PetTypeRepository;

  constructor(petRepository: PetTypeRepository) {
    this.petRepository = petRepository;
  }

  async createPetType(petTypeData: { name: string }): Promise<PetTypeDocument> {
    const { name } = petTypeData;

    // Check if pet type already exists
    const exists = await this.petRepository.checkPetTypeExists(name);
    if (exists) {
      throw new CustomError('Pet type already exists', 400);
    }

    const newPetType = await this.petRepository.createPetType({
      name: name.trim(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return newPetType;
  }

  async getAllPetTypes(): Promise<PetTypeDocument[]> {
    return await this.petRepository.getAllPetTypes();
  }

  async getPetTypeById(id: string): Promise<PetTypeDocument> {
    const petType = await this.petRepository.getPetTypeById(id);
    if (!petType) {
      throw new CustomError('Pet type not found', 404);
    }
    return petType;
  }

  async updatePetType(id: string, updateData: { name: string }): Promise<PetTypeDocument> {
    const { name } = updateData;

    const existingPetType = await this.petRepository.getPetTypeById(id);
    if (!existingPetType) {
      throw new CustomError('Pet type not found', 404);
    }

    if (name && name.trim() !== existingPetType.name) {
      const nameExists = await this.petRepository.checkPetTypeExists(name, id);
      if (nameExists) {
        throw new CustomError('Pet type name already exists', 400);
      }
    }

    const updatedPetType = await this.petRepository.updatePetType(id, {
      name: name.trim(),
      updatedAt: new Date()
    });

    if (!updatedPetType) {
      throw new CustomError('Failed to update pet type', 500);
    }

    return updatedPetType;
  }

  async updatePetTypeStatus(id: string, isActive: boolean): Promise<PetTypeDocument> {
    const existingPetType = await this.petRepository.getPetTypeById(id);
    if (!existingPetType) {
      throw new CustomError('Pet type not found', 404);
    }

    const updatedPetType = await this.petRepository.updatePetTypeStatus(id, isActive);
    if (!updatedPetType) {
      throw new CustomError('Failed to update pet type status', 500);
    }

    return updatedPetType;
  }
}
