import mongoose, { Schema, model, Document, Types } from 'mongoose';
import {
  IAppointment,
  PaymentStatus,
  AppointmentStatus,
  PaymentMethod,
} from '../types/appointment.types';

// Define AppointmentDocument interface
export interface AppointmentDocument extends IAppointment, Document {
  _id: Types.ObjectId;
  bookingNumber: string;  
}

const AppointmentSchema = new Schema<AppointmentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    slotDetails: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      date: { type: String, required: true }, // format: yyyy-MM-dd
    },
    paymentDetails: {
      paymentIntentId: { type: String },
      amount: { type: Number },
      currency: { type: String },
      status: { type: String, enum: Object.values(PaymentStatus) },
      method: { type: String, enum: Object.values(PaymentMethod) },
      paidAt: { type: Date },
    },
    appointmentStatus: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.Pending,
    },
    notes: { type: String },
    bookingNumber: { type: String, unique: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AppointmentSchema.pre<AppointmentDocument>("save", async function (next) {
  if (this.bookingNumber) return next(); 
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const formattedDate = `${dd}${mm}${yyyy}`;

  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const countToday = await Appointment.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const seq = String(countToday + 1).padStart(2, "0");

  this.bookingNumber = `FC${formattedDate}-${seq}`;

  next();
});

export const Appointment = model<AppointmentDocument>(
  "Appointment",
  AppointmentSchema
);
