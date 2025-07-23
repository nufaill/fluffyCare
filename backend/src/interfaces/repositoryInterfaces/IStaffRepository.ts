import { Staff } from 'types/staff.types';
import { Schema } from 'mongoose';

export interface IStaffRepository {
  create(staff: Partial<Staff>): Promise<Staff>;
  findById(id: string | Schema.Types.ObjectId): Promise<Staff | null>;
  findByShopId(shopId: string | Schema.Types.ObjectId): Promise<Staff[]>;
  update(id:string | Schema.Types.ObjectId , staff:Partial<Staff>):Promise<Staff | null>;
  delete(id:string | Schema.Types.ObjectId):Promise<boolean>;
  findByEmail(email: string): Promise<Staff | null>;
}