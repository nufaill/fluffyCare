import { Types } from 'mongoose';

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Ongoing = 'ongoing',
  Cancelled = 'cancelled',
  Completed = 'completed',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'Refunded',
}

export enum PaymentMethod {
  PayPal = 'PayPal',
  Cash = 'Cash',
  Card = 'card',
  Wallet = 'Wallet',
}

export interface SlotDetails {
  startTime: string;
  endTime: string;
  date: string;
}

export interface PaymentDetails {
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: Date;
}

export interface IAppointment {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  petId: Types.ObjectId;
  shopId: Types.ObjectId;
  staffId: Types.ObjectId;
  serviceId: Types.ObjectId;
  slotDetails: SlotDetails;
  appointmentStatus: AppointmentStatus;
  paymentDetails: PaymentDetails;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}