import mongoose, { Schema } from 'mongoose';
import { StaffResponseDTO, createStaffDTO, updatesStaffDTO, UpdateStaffStatusDTO } from '../../dto/staff.dto';

export interface IStaffService {
  create(staff: createStaffDTO & { shopId: string | mongoose.Types.ObjectId }): Promise<StaffResponseDTO>;
  findById(id: string | Schema.Types.ObjectId): Promise<StaffResponseDTO | null>;
  findByShopId(shopId: string | Schema.Types.ObjectId): Promise<StaffResponseDTO[]>;
  getAllStaff(page: number, limit: number, shopId: string | Schema.Types.ObjectId): Promise<{ staff: StaffResponseDTO[]; total: number }>;
  update(id: string | Schema.Types.ObjectId, staff: updatesStaffDTO): Promise<StaffResponseDTO | null>;
  findByEmail(email: string): Promise<StaffResponseDTO | null>;
  toggleStatus(id: string | Schema.Types.ObjectId, status: UpdateStaffStatusDTO): Promise<StaffResponseDTO | null>;
}