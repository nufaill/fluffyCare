import { AppointmentStatus, PaymentStatus, RequestStatus, PaymentMethod } from '../types/appointment.types';

export interface CreateAppointmentDto {
  userId: string;
  petId: string;
  shopId: string;
  serviceId: string;
  staffId: string;
  appointmentDate: string; // Keep this field
  startTime: string; // Keep this field  
  endTime: string; // Keep this field
  paymentDetails?: { // Make this optional or change to paymentMethod
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    paidAt: Date;
  };
  appointmentStatus: AppointmentStatus; // Use correct field name
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