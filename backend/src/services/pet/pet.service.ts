import { PetTypeDocument } from 'types/PetType.type';
import { PetRepository } from '../../repositories/pet.repository';
import { CreatePetData, PetDocument } from '../../types/Pet.types';
import { CustomError } from '../../util/CustomerError';
import { CreatePetDTO, UpdatePetDTO } from '../../dto/pet.dto';
import { IPetService } from '../../interfaces/serviceInterfaces/IPetService';

export class PetService implements IPetService {
  private petRepository: PetRepository;

  constructor(petRepository: PetRepository) {
    this.petRepository = petRepository;
  }

  async createPet(userId: string, petData: CreatePetDTO): Promise<PetDocument> {
    const { name, petTypeId } = petData;

    const nameExists = await this.petRepository.checkPetNameExists(userId, name);
    if (nameExists) {
      throw new CustomError('Pet name already exists for this user', 400);
    }

    const newPet = await this.petRepository.createPet({
      ...petData,
      userId,
      name: name.trim(),
      additionalNotes: petData.additionalNotes ?? '',
      friendlyWithPets: petData.friendlyWithPets ?? false,
      friendlyWithOthers: petData.friendlyWithOthers ?? false,
      trainedBefore: petData.trainedBefore ?? false,
      vaccinationStatus: petData.vaccinationStatus ?? false,
      medication: petData.medication ?? ''
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

  async updatePet(petId: string, userId: string, updateData: UpdatePetDTO): Promise<PetDocument> {
    const existingPet = await this.petRepository.getPetById(petId);
    if (!existingPet) {
      throw new CustomError('Pet not found', 404);
    }

    // Verify ownership
    if (existingPet.userId._id.toString() !== userId) {
      throw new CustomError('Not authorized to update this pet', 403);
    }

    // Check if pet name is being updated and if it already exists
    if (updateData.name && updateData.name.trim() !== existingPet.name) {
      const nameExists = await this.petRepository.checkPetNameExists(userId, updateData.name, petId);
      if (nameExists) {
        throw new CustomError('Pet name already exists for this user', 400);
      }
    }

    // Validate pet type if being updated and is different from current
    if (updateData.petTypeId && updateData.petTypeId !== existingPet.petTypeId.toString()) {
      const petTypes = await this.petRepository.getAllPetTypes();
      const petTypeExists = petTypes.some(type => type._id.toString() === updateData.petTypeId);

      if (!petTypeExists) {
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