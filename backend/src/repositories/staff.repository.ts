import { Schema } from 'mongoose';
import StaffModel from '../models/staff.model';
import { Staff } from '../types/staff.types';
import { IStaffRepository } from '../interfaces/repositoryInterfaces/IStaffRepository';

export class StaffRepository implements IStaffRepository {
  private readonly _model = StaffModel;

  async getAllStaff(page: number = 1, limit: number = 10, shopId: string | Schema.Types.ObjectId): Promise<{ staff: Staff[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [staff, total] = await Promise.all([
        this._model
          .find({ shopId })
          .skip(skip)
          .limit(limit)
          .lean<Staff[]>(),
        this._model.countDocuments({ shopId })
      ]);
      
      return { staff, total };
    } catch (error) {
      throw error;
    }
  }

  async create(staff: Partial<Staff>): Promise<Staff> {
    try {
      const newStaff = await this._model.create(staff);
      return newStaff.toObject() as Staff;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<Staff | null> {
    try {
      const staff = await this._model.findById(id).lean<Staff>();
      return staff;
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async findByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]> {
    try {
      const staff = await this._model
        .find({ shopId })
        .sort({ createdAt: -1 })
        .lean<Staff[]>();
      return staff;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string | Schema.Types.ObjectId, staff: Partial<Staff>): Promise<Staff | null> {
    try {
      const updatedStaff = await this._model
        .findByIdAndUpdate(
          id,
          { $set: staff },
          {
            new: true,
            runValidators: true
          }
        )
        .lean<Staff>();
      return updatedStaff;
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Staff | null> {
    try {
      const staff = await this._model
        .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        .lean<Staff>();
      return staff;
    } catch (error) {
      throw error;
    }
  }

  async findActiveStaffByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]> {
    try {
      const staff = await this._model
        .find({ shopId, isActive: true })
        .sort({ createdAt: -1 })
        .lean<Staff[]>();
      return staff;
    } catch (error) {
      throw error;
    }
  }

  async countByShopId(shopId: string | Schema.Types.ObjectId): Promise<number> {
    try {
      return await this._model.countDocuments({ shopId });
    } catch (error) {
      throw error;
    }
  }
}