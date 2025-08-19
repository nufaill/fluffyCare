import { Types } from 'mongoose';
import { Pet } from '../models/pet.model';
import { CreatePetData, PetDocument } from '../types/Pet.types';
import { PetTypeDocument } from '../types/PetType.type';
import { PetType } from '../models/petType.model';
import { IPetRepository } from '../interfaces/repositoryInterfaces/IPetRepository';

export class PetRepository implements IPetRepository {
  async createPet(petData: CreatePetData): Promise<PetDocument> {
    const pet = new Pet(petData);
    return await pet.save();
  }

  async getPetsByUserId(userId: string): Promise<PetDocument[]> {
    return await Pet.find({ userId: new Types.ObjectId(userId) })
      .populate('petTypeId', 'name')
      .sort({ createdAt: -1 });
  }

  async getPetById(petId: string): Promise<PetDocument | null> {
    return await Pet.findById(petId)
      .populate('petTypeId', 'name')
      .populate('userId', 'name email');
  }

  async updatePet(petId: string, updateData: Partial<CreatePetData>): Promise<PetDocument | null> {
    return await Pet.findByIdAndUpdate(petId, updateData, { new: true })
      .populate('petTypeId', 'name');
  }

  async getPetTypeById(petTypeId: string): Promise<PetTypeDocument | null> {
    return await PetType.findById(petTypeId);
  }

  async checkPetNameExists(userId: string, name: string, excludePetId?: string): Promise<boolean> {
    const query: any = {
      userId: new Types.ObjectId(userId),
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    };
    if (excludePetId) {
      query._id = { $ne: excludePetId };
    }
    const existingPet = await Pet.findOne(query);
    return !!existingPet;
  }

  async getPetsByUserIdAndType(userId: string, petTypeId: string): Promise<PetDocument[]> {
    return await Pet.find({
      userId: new Types.ObjectId(userId),
      petTypeId: new Types.ObjectId(petTypeId)
    });
  }

  async getAllPetTypes(): Promise<PetTypeDocument[]> {
    return await PetType.find().sort({ createdAt: -1 });
  }
}