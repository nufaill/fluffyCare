import { Schema } from 'mongoose';
import { StaffResponseDTO } from '../../dto/staff.dto'

export interface IStaffRepository {
  create(staff: Partial<StaffResponseDTO>): Promise<StaffResponseDTO>;
  findById(id: string | Schema.Types.ObjectId): Promise<StaffResponseDTO | null>;
  findByShopId(shopId: string | Schema.Types.ObjectId): Promise<StaffResponseDTO[]>;
  update(id: string | Schema.Types.ObjectId, staff: Partial<StaffResponseDTO>): Promise<StaffResponseDTO | null>;
  getAllStaff(page: number, limit: number, shopId: string | Schema.Types.ObjectId): Promise<{ staff: StaffResponseDTO[]; total: number }>;
  findByEmail(email: string): Promise<StaffResponseDTO | null>;
}