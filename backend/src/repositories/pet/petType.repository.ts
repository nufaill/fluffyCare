import { PetType } from '../../models/petType.model';
import { CreatePetType, PetTypeDocument } from '../../types/PetType.type';
import { IPetTypeRepository } from '../../interfaces/repositoryInterfaces/IPetTypeRepository';

export class PetTypeRepository implements IPetTypeRepository {
  async createPetType(petTypeData: Partial<CreatePetType>): Promise<PetTypeDocument> {
    const petType = new PetType(petTypeData);
    return await petType.save();
  }

  async getAllPetTypes(): Promise<PetTypeDocument[]> {
    return await PetType.find().sort({ createdAt: -1 });
  }

  async getPetTypeById(id: string): Promise<PetTypeDocument | null> {
    return await PetType.findById(id);
  }

  async updatePetType(id: string, updateData: Partial<CreatePetType>): Promise<PetTypeDocument | null> {
    return await PetType.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updatePetTypeStatus(id: string, isActive: boolean): Promise<PetTypeDocument | null> {
    return await PetType.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  async checkPetTypeExists(name: string, excludeId?: string): Promise<boolean> {
    const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existingPetType = await PetType.findOne(query);
    return !!existingPetType;
  }
}