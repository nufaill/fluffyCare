import { Schema } from 'mongoose';
import { Staff } from '../../types/staff.types';

export interface IStaffRepository {
  getAllStaff(page: number, limit: number, shopId: string | Schema.Types.ObjectId): Promise<{ staff: Staff[]; total: number }>;
  create(staff: Partial<Staff>): Promise<Staff>;
  findById(id: string | Schema.Types.ObjectId): Promise<Staff | null>;
  findByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]>;
  update(id: string | Schema.Types.ObjectId, staff: Partial<Staff>): Promise<Staff | null>;
  findByEmail(email: string): Promise<Staff | null>;
  findActiveStaffByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]>;
  countByShopId(shopId: string | Schema.Types.ObjectId): Promise<number>;
}