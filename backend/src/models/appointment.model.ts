import mongoose, { Schema, model, Document } from 'mongoose';
import {
  IAppointment,
  PaymentStatus,
  AppointmentStatus,
  RequestStatus,
  PaymentMethod,
} from '../types/appointment.types';

export interface AppointmentDocument extends IAppointment, Document {}

const AppointmentSchema = new Schema<AppointmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },

    slotDetails: {
      startTime: { type: String, required: true }, // e.g., "11:00"
      endTime: { type: String, required: true },   // e.g., "12:00"
      date: { type: String, required: true },      // e.g., "2025-08-11"
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
    appointmentStatus: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.Pending,
    },
    requestStatus: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.Pending,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    notes: { type: String },
  },
  
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Appointment = model<AppointmentDocument>('Appointment', AppointmentSchema);
