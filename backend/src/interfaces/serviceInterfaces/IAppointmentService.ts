import { Types } from 'mongoose';
import { AppointmentDocument } from '../../models/appointment.model';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../../dto/appointment.dto';
import { AppointmentStatus } from '../../types/appointment.types';
interface TimeSlot {
  shopId: string;
  staffId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: 'booked';
}
export interface IAppointmentService {
  getBookingAnalytics(
    startDate?: string,
    endDate?: string,
    shopId?: string
  ): Promise<{
    success: boolean;
    data?: {
      overall: {
        total: number;
        pending: number;
        confirmed: number;
        ongoing: number;
        completed: number;
        cancelled: number;
      };
      shopWise: Array<{
        shopId: string;
        shopName: string;
        total: number;
        pending: number;
        confirmed: number;
        ongoing: number;
        completed: number;
        cancelled: number;
      }>;
      serviceTypeBreakdown: Array<{
        name: string;
        value: number;
      }>;
      dailyBookings: Array<{
        day: string;
        bookings: number;
        completed: number;
        cancelled: number;
      }>;
    };
    message: string;
    statusCode: number;
  }>;
  createAppointment(appointmentData: CreateAppointmentDto): Promise<{
    success: boolean;
    data?: AppointmentDocument;
    message: string;
    statusCode: number;
  }>;
  getAppointmentStats(shopId: string, startDate: Date, endDate: Date): Promise<{
    success: boolean;
    data?: number;
    message: string;
    statusCode: number;
  }>;
  checkSlotAvailability(slotDetails: { startTime: string; endTime: string; date: string }, staffId: string): Promise<{
    success: boolean;
    data?: boolean;
    message: string;
    statusCode: number;
  }>;
  updateAppointment(appointmentId: string, updateData: UpdateAppointmentDto, isShop?: boolean): Promise<{
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
  getAppointmentsByUserId(userId: string, options?: { page?: number; limit?: number; status?: string }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
    message: string;
    statusCode: number;
  }>;
  getAppointmentsByShopId(shopId: string, options?: { page?: number; limit?: number; status?: string; date?: string }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
    message: string;
    statusCode: number;
  }>;
  getAppointmentsByStaffId(staffId: string, options?: { page?: number; limit?: number; date?: string }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
    message: string;
    statusCode: number;
  }>;
  getAppointmentsByStatus(status: string, options?: { shopId?: string; page?: number; limit?: number }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
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
  getAppointmentsCount(shopId: Types.ObjectId, startDate: Date, endDate: Date): Promise<number>;
  getAvailableSlots(shopId: string, date: string, staffId?: string): Promise<{
    success: boolean;
    data?: TimeSlot[];
    message: string;
    statusCode: number;
  }>;
  cancelAppointment(appointmentId: string, reason: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;
  startOngoingAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }>;
  getAllAppointments(params: { page?: number; limit?: number; filters?: any }): Promise<{
    success: boolean;
    data?: any;
    message: string;
    statusCode: number;
  }>;
}