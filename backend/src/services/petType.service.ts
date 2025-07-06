import { PetRepository } from '../repositories/petRepository';
import { CreatePetType, PetTypeDocument } from '../types/PetType.type';
import { CreatePetData, PetDocument } from '../types/Pet.types';
import { CustomError } from '../util/CustomerError';

export class PetService {
  private petRepository: PetRepository;

  constructor(petRepository: PetRepository) {
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
   async createPet(userId: string, petData: Omit<CreatePetData, 'userId'>): Promise<PetDocument> {
    const { name, petTypeId } = petData;

    // Validate pet type exists
    const petType = await this.petRepository.getPetTypeById(petTypeId);
    if (!petType) {
      throw new CustomError('Pet type not found', 404);
    }

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
      const petType = await this.petRepository.getPetTypeById(updateData.petTypeId);
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
}
