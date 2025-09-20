import { PetTypeDocument } from 'types/PetType.type';
import { CreatePetDTO, UpdatePetDTO } from '../../dto/pet.dto';
import { PetDocument } from '../../types/Pet.types';
import { CustomError } from '../../util/CustomerError';
import { IPetRepository } from '../../interfaces/repositoryInterfaces/IPetRepository';
import { IPetService } from '../../interfaces/serviceInterfaces/IPetService';
import { AppointmentDocument } from '../../models/appointment.model';

export interface PetWithBookings extends PetDocument {
  bookings: AppointmentDocument[];
}

export class PetService implements IPetService {
  private _petRepository: IPetRepository;

  constructor(petRepository: IPetRepository) {
    this._petRepository = petRepository;
  }

  async createPet(userId: string, petData: CreatePetDTO): Promise<PetDocument> {
    const { name, petTypeId } = petData;

    const nameExists = await this._petRepository.checkPetNameExists(userId, name);
    if (nameExists) {
      throw new CustomError('Pet name already exists for this user', 400);
    }

    const newPet = await this._petRepository.createPet({
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
    return await this._petRepository.getPetsByUserId(userId);
  }

  async getPetById(petId: string): Promise<PetDocument> {
    const pet = await this._petRepository.getPetById(petId);
    if (!pet) {
      throw new CustomError('Pet not found', 404);
    }
    return pet;
  }

  async updatePet(petId: string, userId: string, updateData: UpdatePetDTO): Promise<PetDocument> {
    const existingPet = await this._petRepository.getPetById(petId);
    if (!existingPet) {
      throw new CustomError('Pet not found', 404);
    }

    if (existingPet.userId._id.toString() !== userId) {
      throw new CustomError('Not authorized to update this pet', 403);
    }

    if (updateData.petTypeId && updateData.petTypeId !== existingPet.petTypeId.toString()) {
      const petTypes = await this._petRepository.getAllPetTypes();
      const petTypeExists = petTypes.some(type => type._id.toString() === updateData.petTypeId);

      if (!petTypeExists) {
        throw new CustomError('Pet type not found', 404);
      }
    }

    const updatedPet = await this._petRepository.updatePet(petId, {
      ...updateData,
      name: updateData.name?.trim(),
    });

    if (!updatedPet) {
      throw new CustomError('Failed to update pet', 500);
    }

    return updatedPet;
  }

  async getAllPetTypes(): Promise<PetTypeDocument[]> {
    return await this._petRepository.getAllPetTypes();
  }

  async getPetWithBookingsById(petId: string): Promise<PetWithBookings> {
    const pet = await this._petRepository.getPetWithBookingsById(petId);
    if (!pet) {
      throw new CustomError('Pet not found', 404);
    }
    return pet;
  }
}