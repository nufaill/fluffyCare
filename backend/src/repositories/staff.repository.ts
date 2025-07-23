import { Schema } from 'mongoose';
import StaffModel from '../models/staff.model';
import { Staff } from '../types/staff.types';
import { IStaffRepository } from '../interfaces/repositoryInterfaces/IStaffRepository';

export class StaffRepository implements IStaffRepository {
  private model = StaffModel;

  async create(staff: Partial<Staff>): Promise<Staff> {
    try {
      const newStaff = await this.model.create(staff);
      return newStaff.toObject() as Staff;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<Staff | null> {
    try {
      const staff = await this.model.findById(id).lean<Staff>();
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
      const staff = await this.model
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
      const updatedStaff = await this.model
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

  async delete(id: string | Schema.Types.ObjectId): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      if (error instanceof Error && error.name === 'CastError') {
        return false;
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Staff | null> {
    try {
      const staff = await this.model
        .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }) 
        .lean<Staff>();
      return staff;
    } catch (error) {
      throw error;
    }
  }

  async findActiveStaffByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]> {
    try {
      const staff = await this.model
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
      return await this.model.countDocuments({ shopId });
    } catch (error) {
      throw error;
    }
  }
}