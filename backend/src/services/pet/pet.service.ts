import { PetTypeDocument } from 'types/PetType.type';
import { PetRepository } from '../../repositories/pet.repository';
import { CreatePetData, PetDocument } from '../../types/Pet.types';
import { CustomError } from '../../util/CustomerError';

export class PetService {
  private petRepository: PetRepository;

  constructor(petRepository: PetRepository) {
    this.petRepository = petRepository;
  }
    async createPet(userId: string, petData: Omit<CreatePetData, 'userId'>): Promise<PetDocument> {
    const { name, petTypeId } = petData;

    // Check if pet name already exists for this user
    const nameExists = await this.petRepository.checkPetNameExists(userId, name);
    if (nameExists) {
      throw new CustomError('Pet name already exists for this user', 400);
    }

    const newPet = await this.petRepository.createPet({
      ...petData,
      userId,
      name: name.trim(),
    });

    return newPet;
  }

  async getPetsByUserId(userId: string): Promise<PetDocument[]> {
    return await this.petRepository.getPetsByUserId(userId);
  }

  async getPetById(petId: string): Promise<PetDocument> {
    const pet = await this.petRepository.getPetById(petId);
    if (!pet) {
      throw new CustomError('Pet not found', 404);
    }
    return pet;
  }

  async updatePet(petId: string, userId: string, updateData: Partial<Omit<CreatePetData, 'userId'>>): Promise<PetDocument> {
    const existingPet = await this.petRepository.getPetById(petId);
    if (!existingPet) {
      throw new CustomError('Pet not found', 404);
    }

    // Verify ownership
    if (existingPet.userId.toString() !== userId) {
      throw new CustomError('Not authorized to update this pet', 403);
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name.trim() !== existingPet.name) {
      const nameExists = await this.petRepository.checkPetNameExists(userId, updateData.name, petId);
      if (nameExists) {
        throw new CustomError('Pet name already exists for this user', 400);
      }
    }

    // If pet type is being updated, validate it exists
    if (updateData.petTypeId) {
      const petType = await this.petRepository.getPetById(updateData.petTypeId);
      if (!petType) {
        throw new CustomError('Pet type not found', 404);
      }
    }

    const updatedPet = await this.petRepository.updatePet(petId, {
      ...updateData,
      name: updateData.name?.trim(),
    });

    if (!updatedPet) {
      throw new CustomError('Failed to update pet', 500);
    }

    return updatedPet;
  }
    async getAllPetTypes(): Promise<PetTypeDocument[]> {
      return await this.petRepository.getAllPetTypes();
    }
}