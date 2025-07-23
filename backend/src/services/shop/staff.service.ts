import { Schema } from 'mongoose';
import { Staff } from '../../types/staff.types';
import { IStaffService } from '../../interfaces/serviceInterfaces/IStaffService';
import { StaffRepository } from '../../repositories/staff.repository';
import { CustomError } from '../../util/CustomerError';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';

export class StaffService implements IStaffService {
constructor(private staffRepository: StaffRepository) {}
  async create(staff: Partial<Staff>): Promise<Staff> {
    if (!staff.name) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: name`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!staff.shopId) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: shopId`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (staff.email) {
      const existingStaff = await this.staffRepository.findByEmail(staff.email);
      if (existingStaff) {
        throw new CustomError(
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    return await this.staffRepository.create(staff);
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<Staff | null> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }
    return staff;
  }

  async findByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]> {
    if (!shopId) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: shopId`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return await this.staffRepository.findByShopId(shopId);
  }

  async update(id: string | Schema.Types.ObjectId, staff: Partial<Staff>): Promise<Staff | null> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if staff exists
    const existingStaff = await this.staffRepository.findById(id);
    if (!existingStaff) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (staff.email) {
      const staffWithEmail = await this.staffRepository.findByEmail(staff.email);
      if (staffWithEmail && staffWithEmail._id.toString() !== id.toString()) {
        throw new CustomError(
          ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const updatedStaff = await this.staffRepository.update(id, staff);
    return updatedStaff;
  }

  async delete(id: string | Schema.Types.ObjectId): Promise<boolean> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const exists = await this.staffRepository.findById(id);
    if (!exists) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    return await this.staffRepository.delete(id);
  }

  async findByEmail(email: string): Promise<Staff | null> {
    if (!email) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: email`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    return await this.staffRepository.findByEmail(email);
  }

  async toggleStatus(id: string | Schema.Types.ObjectId): Promise<Staff | null> {
    if (!id) {
      throw new CustomError(
        `${ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: id`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const staff = await this.staffRepository.findById(id);
    if (!staff) {
      throw new CustomError(
        `${ERROR_MESSAGES.NOT_FOUND}: Staff`,
        HTTP_STATUS.NOT_FOUND
      );
    }
    
    const updatedStaff = await this.staffRepository.update(id, {
      isActive: !staff.isActive,
    });
    
    return updatedStaff;
  }
}