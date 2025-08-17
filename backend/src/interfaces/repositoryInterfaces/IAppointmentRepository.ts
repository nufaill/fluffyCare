import { Types } from 'mongoose';
import { AppointmentDocument } from '../../models/appointment.model';
import { IAppointment, AppointmentStatus } from '../../types/appointment.types';

export interface IAppointmentRepository {
  create(appointmentData: Partial<IAppointment>): Promise<AppointmentDocument>;
  update(appointmentId: Types.ObjectId, updateData: Partial<IAppointment>): Promise<AppointmentDocument | null>;
  cancel(appointmentId: Types.ObjectId, reason: string): Promise<AppointmentDocument | null>;
  findById(appointmentId: Types.ObjectId): Promise<AppointmentDocument | null>;
  findByUserId(
    userId: Types.ObjectId,
    options?: { page?: number; limit?: number; status?: string }
  ): Promise<{ items: AppointmentDocument[]; total: number }>;
  findByShopId(
    shopId: Types.ObjectId,
    options?: { page?: number; limit?: number; status?: string; date?: string }
  ): Promise<{ items: AppointmentDocument[]; total: number }>;
  findByStaffId(
    staffId: Types.ObjectId,
    options?: { page?: number; limit?: number; date?: string }
  ): Promise<{ items: AppointmentDocument[]; total: number }>;
  findByStatus(
    status: AppointmentStatus,
    shopId?: Types.ObjectId,
    options?: { page?: number; limit?: number }
  ): Promise<{ items: AppointmentDocument[]; total: number }>;
  getAppointmentsCount(shopId: Types.ObjectId, startDate: Date, endDate: Date): Promise<number>;
  isTimeSlotAvailable(
    staffId: Types.ObjectId,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: Types.ObjectId
  ): Promise<boolean>;
  findBookedSlots(filter: any): Promise<AppointmentDocument[]>;
  isSlotBooked(
    shopId: Types.ObjectId,
    staffId: Types.ObjectId,
    date: string,
    startTime: string
  ): Promise<boolean>;
}