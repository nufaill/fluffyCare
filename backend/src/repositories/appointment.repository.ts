import { Types } from 'mongoose';
import { Appointment, AppointmentDocument } from '../models/appointment.model';
import { IAppointment, AppointmentStatus, RequestStatus } from '../types/appointment.types';
import { IAppointmentRepository } from '../interfaces/repositoryInterfaces/IAppointmentRepository';

export class AppointmentRepository implements IAppointmentRepository {
  async create(appointmentData: Partial<IAppointment>): Promise<AppointmentDocument> {
    try {
      const appointment = new Appointment(appointmentData);
      return await appointment.save();
    } catch (error) {
      throw new Error(`Failed to create appointment: ${error}`);
    }
  }

  async update(
    appointmentId: Types.ObjectId,
    updateData: Partial<IAppointment>
  ): Promise<AppointmentDocument | null> {
    try {
      return await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update appointment: ${error}`);
    }
  }

  async cancel(appointmentId: Types.ObjectId): Promise<AppointmentDocument | null> {
    try {
      return await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          appointmentStatus: AppointmentStatus.Cancelled, 
          requestStatus: RequestStatus.Rejected 
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to cancel appointment: ${error}`);
    }
  }

  async findById(appointmentId: Types.ObjectId): Promise<AppointmentDocument | null> {
    try {
      return await Appointment.findById(appointmentId)
        .populate('userId', 'name email phone')
        .populate('petId', 'name breed age')
        .populate('shopId', 'name address phone')
        .populate('staffId', 'name specialization')
        .populate('serviceId', 'name price duration')
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointment: ${error}`);
    }
  }

  async findByUserId(
    userId: Types.ObjectId,
    options: { page?: number; limit?: number } = {}
  ): Promise<AppointmentDocument[]> {
    try {
      const { page = 1, limit = 10 } = options;
      return await Appointment.find({ userId })
        .populate('petId', 'name breed')
        .populate('shopId', 'name address')
        .populate('serviceId', 'name price')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by user: ${error}`);
    }
  }

  async findByShopId(
    shopId: Types.ObjectId,
    options: { page?: number; limit?: number } = {}
  ): Promise<AppointmentDocument[]> {
    try {
      const { page = 1, limit = 10 } = options;
      return await Appointment.find({ shopId })
        .populate('userId', 'name email phone')
        .populate('petId', 'name breed')
        .populate('staffId', 'name')
        .populate('serviceId', 'name duration')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by shop: ${error}`);
    }
  }

  async findByStaffId(
    staffId: Types.ObjectId,
    options: { page?: number; limit?: number } = {}
  ): Promise<AppointmentDocument[]> {
    try {
      const { page = 1, limit = 10 } = options;
      return await Appointment.find({ staffId })
        .populate('userId', 'name phone')
        .populate('petId', 'name breed')
        .populate('serviceId', 'name duration')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by staff: ${error}`);
    }
  }

  async findByStatus(
    status: AppointmentStatus,
    shopId?: Types.ObjectId,
    options: { page?: number; limit?: number } = {}
  ): Promise<AppointmentDocument[]> {
    try {
      const { page = 1, limit = 10 } = options;
      const filter: any = { appointmentStatus: status };
      if (shopId) {
        filter.shopId = shopId;
      }

      return await Appointment.find(filter)
        .populate('userId', 'name phone')
        .populate('petId', 'name breed')
        .populate('serviceId', 'name duration')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find appointments by status: ${error}`);
    }
  }

async getAppointmentsCount(
  shopId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    return await Appointment.countDocuments({
      shopId,
      createdAt: { $gte: startDate, $lte: endDate },
      appointmentStatus: { $ne: AppointmentStatus.Cancelled } 
    }).exec();
  } catch (error) {
    throw new Error(`Failed to get appointments count: ${error}`);
  }
}

  async isTimeSlotAvailable(
    staffId: Types.ObjectId,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: Types.ObjectId
  ): Promise<boolean> {
    try {
      const filter: any = {
        staffId,
        'slotDetails.date': date,
        appointmentStatus: { $ne: AppointmentStatus.Cancelled }
      };

      if (excludeAppointmentId) {
        filter._id = { $ne: excludeAppointmentId };
      }

      const appointments = await Appointment.find(filter)
        .select('slotDetails.startTime slotDetails.endTime')
        .exec();

      const hasOverlap = appointments.some(appt => {
        const otherStart = appt.slotDetails.startTime;
        const otherEnd = appt.slotDetails.endTime;
        return !(endTime <= otherStart || startTime >= otherEnd);
      });

      return !hasOverlap;
    } catch (error) {
      throw new Error(`Failed to check time slot availability: ${error}`);
    }
  }

  async delete(appointmentId: Types.ObjectId): Promise<boolean> {
    try {
      const result = await Appointment.findByIdAndDelete(appointmentId).exec();
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete appointment: ${error}`);
    }
  }
  async findBookedSlots(filter: any): Promise<AppointmentDocument[]> {
    try {
      return await Appointment.find(filter)
        .select('staffId slotDetails appointmentStatus')
        .lean()
        .exec();
    } catch (error) {
      throw new Error(`Failed to find booked slots: ${error}`);
    }
  }
  async isSlotBooked(
    shopId: Types.ObjectId,
    staffId: Types.ObjectId,
    date: string,
    startTime: string
  ): Promise<boolean> {
    try {
      const existingBooking = await Appointment.findOne({
        shopId,
        staffId,
        'slotDetails.date': date,
        'slotDetails.startTime': startTime,
        appointmentStatus: { $ne: AppointmentStatus.Cancelled }
      }).exec();

      return !!existingBooking;
    } catch (error) {
      throw new Error(`Failed to check slot booking status: ${error}`);
    }
  }
}