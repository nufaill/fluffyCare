// src/types/appointment.types.ts
import { Types } from 'mongoose';

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export enum RequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  PayPal = 'PayPal',
  Cash = 'Cash',
  Card = 'card',
}

export interface SlotDetails {
  startTime: string;
  endTime: string;
  date: string;
}

export interface IAppointment {
  userId: Types.ObjectId;
  petId: Types.ObjectId;
  shopId: Types.ObjectId;
  staffId: Types.ObjectId;
  serviceId: Types.ObjectId;
  slotDetails: SlotDetails;
  paymentStatus: PaymentStatus;
  appointmentStatus: AppointmentStatus;
  requestStatus: RequestStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
