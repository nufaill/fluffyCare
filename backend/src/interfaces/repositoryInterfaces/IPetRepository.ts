import { AppointmentDocument } from '../../models/appointment.model';
import { CreatePetData, PetDocument } from '../../types/Pet.types';
import { PetTypeDocument } from '../../types/PetType.type';

export interface PetWithBookings extends PetDocument {
  bookings: AppointmentDocument[];
}

export interface IPetRepository {
  createPet(petData: CreatePetData): Promise<PetDocument>;
  getPetsByUserId(userId: string): Promise<PetDocument[]>;
  getPetById(petId: string): Promise<PetDocument | null>;
  updatePet(petId: string, updateData: Partial<CreatePetData>): Promise<PetDocument | null>;
  getPetTypeById(petTypeId: string): Promise<PetTypeDocument | null>;
  checkPetNameExists(userId: string, name: string, excludePetId?: string): Promise<boolean>;
  getPetsByUserIdAndType(userId: string, petTypeId: string): Promise<PetDocument[]>;
  getAllPetTypes(): Promise<PetTypeDocument[]>;
  getPetWithBookingsById(petId: string): Promise<PetWithBookings | null>;
}