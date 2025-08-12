import { AppointmentStatus, PaymentStatus, RequestStatus, PaymentMethod } from '../types/appointment.types';

export interface CreateAppointmentDto {
  userId: string;
  petId: string;
  shopId: string;
  serviceId: string;
  staffId: string;
  slotDetails: { 
    startTime: string;
    endTime: string;
    date: string;
  };
  paymentDetails?: {
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    paidAt: Date;
  };
  appointmentStatus: AppointmentStatus; 
  paymentStatus: PaymentStatus;
  requestStatus: RequestStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}
export interface UpdateAppointmentDto {
  staffId?: string;
  serviceId?: string;
  slotDetails?: {
    startTime: string;
    endTime: string;
    date: string;
  };
  paymentStatus?: PaymentStatus;
  appointmentStatus?: AppointmentStatus;
  requestStatus?: RequestStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
}