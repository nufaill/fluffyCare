import { IPetTypeRepository } from '../../interfaces/repositoryInterfaces/IPetTypeRepository';
import { PetTypeDocument, CreatePetType } from '../../types/PetType.type';
import { CustomError } from '../../util/CustomerError';
import { CreatePetTypeDTO, UpdatePetTypeDTO } from '../../dto/petType.dto';
import { IPetTypeService } from '../../interfaces/serviceInterfaces/IPetTypeService';

export class PetTypeService implements IPetTypeService {
  private _petRepository: IPetTypeRepository;

  constructor(petRepository: IPetTypeRepository) {
    this._petRepository = petRepository;
  }

  private validateName(name: string): void {
    const nameRegex = /^[a-zA-Z0-9]+$/;
    if (!name) {
      throw new CustomError('Pet type name is required', 400);
    }
    if (name.length < 1 || name.length > 20) {
      throw new CustomError('Pet type name must be between 1 and 20 characters', 400);
    }
    if (name.includes(' ')) {
      throw new CustomError('Pet type name cannot contain spaces', 400);
    }
    if (!nameRegex.test(name)) {
      throw new CustomError('Pet type name can only contain alphanumeric characters', 400);
    }
  }

  async createPetType(petTypeData: CreatePetTypeDTO): Promise<PetTypeDocument> {
    const { name } = petTypeData;
    this.validateName(name);

    const exists = await this._petRepository.checkPetTypeExists(name);
    if (exists) {
      throw new CustomError('Pet type already exists', 400);
    }

    const newPetType = await this._petRepository.createPetType({
      name,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newPetType;
  }

  async getAllPetTypes(filter?: string): Promise<PetTypeDocument[]> {
    return await this._petRepository.getAllPetTypes(filter);
  }

  async getPetTypeById(id: string): Promise<PetTypeDocument | null> {
    const petType = await this._petRepository.getPetTypeById(id);
    if (!petType) {
      throw new CustomError('Pet type not found', 404);
    }
    return petType;
  }

  async updatePetType(id: string, updateData: UpdatePetTypeDTO): Promise<PetTypeDocument | null> {
    const { name } = updateData;

    const existingPetType = await this._petRepository.getPetTypeById(id);
    if (!existingPetType) {
      throw new CustomError('Pet type not found', 404);
    }

    if (name && name !== existingPetType.name) {
      this.validateName(name);
      const nameExists = await this._petRepository.checkPetTypeExists(name, id);
      if (nameExists) {
        throw new CustomError('Pet type name already exists', 400);
      }
    }

    const updatedPetType = await this._petRepository.updatePetType(id, {
      name,
      updatedAt: new Date(),
    });

    if (!updatedPetType) {
      throw new CustomError('Failed to update pet type', 500);
    }

    return updatedPetType;
  }

  async updatePetTypeStatus(id: string, isActive: boolean): Promise<PetTypeDocument> {
    const existingPetType = await this._petRepository.getPetTypeById(id);
    if (!existingPetType) {
      throw new CustomError('Pet type not found', 404);
    }

    const updatedPetType = await this._petRepository.updatePetTypeStatus(id, isActive);
    if (!updatedPetType) {
      throw new CustomError('Failed to update pet type status', 500);
    }

    return updatedPetType;
  }
}