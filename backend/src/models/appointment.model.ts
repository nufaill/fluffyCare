import mongoose, { Schema, model, Document, Types } from 'mongoose';
import {
  IAppointment,
  PaymentStatus,
  AppointmentStatus,
  PaymentMethod,
  PaymentDetails,
} from '../types/appointment.types';

// Define AppointmentDocument interface
export interface AppointmentDocument extends IAppointment, Document {
  _id: Types.ObjectId;
}

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
    paymentDetails: {
      paymentIntentId: { type: String, required: false },
      amount: { type: Number, required: false },
      currency: { type: String, required: false },
      status: { type: String, enum: Object.values(PaymentStatus), required: false },
      method: { type: String, enum: Object.values(PaymentMethod), required: false },
      paidAt: { type: Date, required: false },
    },
    appointmentStatus: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.Pending,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Appointment = model<AppointmentDocument>('Appointment', AppointmentSchema);