import { Types } from 'mongoose';
import { AppointmentDocument } from '../../models/appointment.model';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../../dto/appointment.dto';
import { AppointmentStatus } from '../../types/appointment.types';

export interface IAppointmentService {
  createAppointment(appointmentData: CreateAppointmentDto): Promise<{
    success: boolean;
    data?: AppointmentDocument;
    message: string;
    statusCode: number;
  }>;

  updateAppointment(
    appointmentId: string,
    updateData: UpdateAppointmentDto
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;

  cancelAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;

  getAppointmentById(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;

  getAppointmentsByUserId(
    userId: string,
    options?: { page?: number; limit?: number; status?: string }
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }>;

  getAppointmentsByShopId(
    shopId: string,
    options?: { page?: number; limit?: number; status?: string; date?: string }
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }>;

  getAppointmentsByStaffId(
    staffId: string,
    options?: { page?: number; limit?: number; date?: string }
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }>;

  getAppointmentsByStatus(
    status: string,
    options?: { shopId?: string; page?: number; limit?: number }
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }>;

  checkSlotAvailability(
    slotDetails: { startTime: string; endTime: string; date: string },
    staffId: string
  ): Promise<{
    success: boolean;
    data?: boolean;
    message: string;
    statusCode: number;
  }>;

  deleteAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;

  confirmAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;

  completeAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;

  getAppointmentsCount(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<number>;
}