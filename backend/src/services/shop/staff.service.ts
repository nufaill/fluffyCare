import mongoose, { Schema } from 'mongoose';
import { Staff } from '../../types/staff.types';
import { IStaffService } from '../../interfaces/serviceInterfaces/IStaffService';
import { IStaffRepository } from '../../interfaces/repositoryInterfaces/IStaffRepository';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { createStaffDTO, updatesStaffDTO, UpdateStaffStatusDTO, StaffResponseDTO } from '../../dto/staff.dto';

export class StaffService implements IStaffService {
  private readonly _staffRepository: IStaffRepository;

  constructor(staffRepository: IStaffRepository) {
    this._staffRepository = staffRepository;
  }

  async create(
    staffDTO: createStaffDTO & { shopId: string | mongoose.Types.ObjectId }
  ): Promise<StaffResponseDTO> {
    if (!staffDTO.name) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: name`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!staffDTO.shopId) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: shopId`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (staffDTO.email) {
      const existingStaff = await this._staffRepository.findByEmail(staffDTO.email);
      if (existingStaff) {
        throw new CustomError(
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const payload = {
      ...staffDTO,
      shopId: new mongoose.Types.ObjectId(staffDTO.shopId)
    };

    const staff = await this._staffRepository.create(payload);
    return this._mapToResponseDTO(staff);
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<StaffResponseDTO | null> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const staff = await this._staffRepository.findById(id);
    if (!staff) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return this._mapToResponseDTO(staff);
  }

  async findByShopId(shopId: string | Schema.Types.ObjectId): Promise<StaffResponseDTO[]> {
    if (!shopId) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: shopId`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const staffList = await this._staffRepository.findByShopId(shopId);
    return staffList.map(staff => this._mapToResponseDTO(staff));
  }

  async getAllStaff(page: number = 1, limit: number = 10, shopId: string | Schema.Types.ObjectId): Promise<{ staff: StaffResponseDTO[]; total: number }> {
    if (!shopId) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: shopId`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const result = await this._staffRepository.getAllStaff(page, limit, shopId);
    return {
      staff: result.staff.map(staff => this._mapToResponseDTO(staff)),
      total: result.total
    };
  }

  async update(id: string | Schema.Types.ObjectId, staffDTO: updatesStaffDTO): Promise<StaffResponseDTO | null> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingStaff = await this._staffRepository.findById(id);
    if (!existingStaff) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (staffDTO.email) {
      const staffWithEmail = await this._staffRepository.findByEmail(staffDTO.email);
      if (staffWithEmail && staffWithEmail._id.toString() !== id.toString()) {
        throw new CustomError(
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const updatedStaff = await this._staffRepository.update(id, staffDTO);
    return updatedStaff ? this._mapToResponseDTO(updatedStaff) : null;
  }

  async findByEmail(email: string): Promise<StaffResponseDTO | null> {
    if (!email) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: email`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const staff = await this._staffRepository.findByEmail(email);
    return staff ? this._mapToResponseDTO(staff) : null;
  }

  async toggleStatus(id: string | Schema.Types.ObjectId, statusDTO: UpdateStaffStatusDTO): Promise<StaffResponseDTO | null> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const staff = await this._staffRepository.findById(id);
    if (!staff) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    const updatedStaff = await this._staffRepository.update(id, {
      isActive: statusDTO.isActive
    });
    
    return updatedStaff ? this._mapToResponseDTO(updatedStaff) : null;
  }

  private _mapToResponseDTO(staff: Staff): StaffResponseDTO {
    return {
      _id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      isActive: staff.isActive
    };
  }
}