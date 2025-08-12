import { Types } from 'mongoose';
import { AppointmentDocument } from '../../models/appointment.model';
import { IAppointment } from '../../types/appointment.types';

export interface IAppointmentRepository {
  create(appointmentData: Partial<IAppointment>): Promise<AppointmentDocument>;
  update(appointmentId: Types.ObjectId, updateData: Partial<IAppointment>): Promise<AppointmentDocument | null>;
  cancel(appointmentId: Types.ObjectId): Promise<AppointmentDocument | null>;
}