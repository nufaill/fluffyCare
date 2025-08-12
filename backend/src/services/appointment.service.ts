import { Types } from 'mongoose';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentDocument } from '../models/appointment.model';
import { IAppointment, AppointmentStatus, PaymentStatus, RequestStatus, PaymentMethod } from '../types/appointment.types';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/appointment.dto';
import { ERROR_MESSAGES, HTTP_STATUS } from '../shared/constant';
import { IAppointmentService } from '../interfaces/serviceInterfaces/IAppointmentService';

export class AppointmentService implements IAppointmentService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  private validateId(id: string): { isValid: boolean; objectId?: Types.ObjectId } {
    if (!Types.ObjectId.isValid(id)) {
      return { isValid: false };
    }
    return { isValid: true, objectId: new Types.ObjectId(id) };
  }

  private validateEnums(data: Partial<CreateAppointmentDto | UpdateAppointmentDto>): boolean {
    if (data.paymentStatus && !Object.values(PaymentStatus).includes(data.paymentStatus)) {
      return false;
    }
    if (data.appointmentStatus && !Object.values(AppointmentStatus).includes(data.appointmentStatus)) {
      return false;
    }
    if (data.requestStatus && !Object.values(RequestStatus).includes(data.requestStatus)) {
      return false;
    }
    if (data.paymentMethod && !Object.values(PaymentMethod).includes(data.paymentMethod)) {
      return false;
    }
    return true;
  }

  private validateSlotDetails(slotDetails: { startTime: string; endTime: string; date: string }): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return (
      timeRegex.test(slotDetails.startTime) &&
      timeRegex.test(slotDetails.endTime) &&
      dateRegex.test(slotDetails.date) &&
      slotDetails.startTime < slotDetails.endTime
    );
  }

  async createAppointment(appointmentData: CreateAppointmentDto): Promise<{
    success: boolean;
    data?: AppointmentDocument;
    message: string;
    statusCode: number;
  }> {
    try {
      // Validate required fields
      if (
        !appointmentData.userId ||
        !appointmentData.petId ||
        !appointmentData.shopId ||
        !appointmentData.staffId ||
        !appointmentData.serviceId ||
        !appointmentData.slotDetails ||
        !appointmentData.paymentMethod
      ) {
        return {
          success: false,
          message: ERROR_MESSAGES.MISSING_REQUIRED_FIELD,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      // Validate slotDetails format
      if (!this.validateSlotDetails(appointmentData.slotDetails)) {
        return {
          success: false,
          message: 'Invalid slotDetails format or values',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      // Validate enums
      if (!this.validateEnums(appointmentData)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      // Validate IDs
      const ids = [
        appointmentData.userId,
        appointmentData.petId,
        appointmentData.shopId,
        appointmentData.serviceId,
        appointmentData.staffId,
      ];
      for (const id of ids) {
        if (!Types.ObjectId.isValid(id)) {
          return {
            success: false,
            message: ERROR_MESSAGES.INVALID_ID,
            statusCode: HTTP_STATUS.BAD_REQUEST,
          };
        }
      }

      // Check if time slot is available
      const isSlotAvailable = await this.appointmentRepository.isTimeSlotAvailable(
        new Types.ObjectId(appointmentData.staffId),
        appointmentData.slotDetails.date,
        appointmentData.slotDetails.startTime,
        appointmentData.slotDetails.endTime
      );

      if (!isSlotAvailable) {
        return {
          success: false,
          message: ERROR_MESSAGES.SLOT_NOT_AVAILABLE,
          statusCode: HTTP_STATUS.CONFLICT,
        };
      }

      // Create appointment with default statuses
      const appointmentToCreate: Partial<IAppointment> = {
        ...appointmentData,
        userId: new Types.ObjectId(appointmentData.userId),
        petId: new Types.ObjectId(appointmentData.petId),
        shopId: new Types.ObjectId(appointmentData.shopId),
        staffId: new Types.ObjectId(appointmentData.staffId),
        serviceId: new Types.ObjectId(appointmentData.serviceId),
        slotDetails: appointmentData.slotDetails,
        paymentStatus: appointmentData.paymentStatus || PaymentStatus.Pending,
        appointmentStatus: appointmentData.appointmentStatus || AppointmentStatus.Pending,
        requestStatus: appointmentData.requestStatus || RequestStatus.Pending,
        paymentMethod: appointmentData.paymentMethod,
      };

      const appointment = await this.appointmentRepository.create(appointmentToCreate);

      return {
        success: true,
        data: appointment,
        message: "Appointment created successfully",
        statusCode: HTTP_STATUS.CREATED,
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CREATE_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateAppointment(
    appointmentId: string,
    updateData: UpdateAppointmentDto
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(appointmentId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      // Validate enums
      if (!this.validateEnums(updateData)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      // Validate slotDetails format if provided
      if (updateData.slotDetails && !this.validateSlotDetails(updateData.slotDetails)) {
        return {
          success: false,
          message: 'Invalid slotDetails format or values',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      // Validate IDs if provided
      const idsToValidate = [updateData.staffId, updateData.serviceId].filter(id => id !== undefined);
      for (const id of idsToValidate) {
        if (!Types.ObjectId.isValid(id!)) {
          return {
            success: false,
            message: ERROR_MESSAGES.INVALID_ID,
            statusCode: HTTP_STATUS.BAD_REQUEST,
          };
        }
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this.appointmentRepository.findById(appointmentObjectId);
      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      // If updating slotDetails or staff, check availability
      if (updateData.slotDetails || updateData.staffId) {
        const newSlotDetails = updateData.slotDetails || existingAppointment.slotDetails;
        const staffId = updateData.staffId
          ? new Types.ObjectId(updateData.staffId)
          : existingAppointment.staffId;

        const isSlotAvailable = await this.appointmentRepository.isTimeSlotAvailable(
          staffId,
          newSlotDetails.date,
          newSlotDetails.startTime,
          newSlotDetails.endTime,
          appointmentObjectId
        );

        if (!isSlotAvailable) {
          return {
            success: false,
            message: ERROR_MESSAGES.SLOT_NOT_AVAILABLE,
            statusCode: HTTP_STATUS.CONFLICT
          };
        }
      }

      // Construct processedUpdateData with explicit typing
      const processedUpdateData: Partial<IAppointment> = {};

      // Copy non-ID fields
      if (updateData.paymentStatus) processedUpdateData.paymentStatus = updateData.paymentStatus;
      if (updateData.appointmentStatus) processedUpdateData.appointmentStatus = updateData.appointmentStatus;
      if (updateData.requestStatus) processedUpdateData.requestStatus = updateData.requestStatus;
      if (updateData.paymentMethod) processedUpdateData.paymentMethod = updateData.paymentMethod;
      if (updateData.notes) processedUpdateData.notes = updateData.notes;
      if (updateData.slotDetails) processedUpdateData.slotDetails = updateData.slotDetails;

      // Convert and assign ID fields
      if (updateData.staffId) {
        processedUpdateData.staffId = new Types.ObjectId(updateData.staffId);
      }
      if (updateData.serviceId) {
        processedUpdateData.serviceId = new Types.ObjectId(updateData.serviceId);
      }

      const updatedAppointment = await this.appointmentRepository.update(
        appointmentObjectId,
        processedUpdateData
      );

      return {
        success: true,
        data: updatedAppointment,
        message: 'Appointment updated successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async cancelAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(appointmentId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this.appointmentRepository.findById(appointmentObjectId);
      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Canceled) {
        return {
          success: false,
          message: 'Appointment is already canceled',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Completed) {
        return {
          success: false,
          message: 'Cannot cancel completed appointment',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const canceledAppointment = await this.appointmentRepository.cancel(appointmentObjectId);

      return {
        success: true,
        data: canceledAppointment,
        message: 'Appointment canceled successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CANCEL_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentById(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(appointmentId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointment = await this.appointmentRepository.findById(idValidation.objectId!);

      if (!appointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        data: appointment,
        message: 'Appointment retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByUserId(
    userId: string,
    options: { page?: number; limit?: number; status?: string } = {}
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(userId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (options.status && !Object.values(AppointmentStatus).includes(options.status as AppointmentStatus)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointments = await this.appointmentRepository.findByUserId(idValidation.objectId!, options);

      return {
        success: true,
        data: appointments,
        message: 'User appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_USER_APPOINTMENTS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByShopId(
    shopId: string,
    options: { page?: number; limit?: number; status?: string; date?: string } = {}
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(shopId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (options.status && !Object.values(AppointmentStatus).includes(options.status as AppointmentStatus)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointments = await this.appointmentRepository.findByShopId(idValidation.objectId!, options);

      if (options.date) {
        const filteredAppointments = appointments.filter(appt => {
          return appt.slotDetails.date === options.date;
        });
        return {
          success: true,
          data: filteredAppointments,
          message: 'Shop appointments retrieved successfully',
          statusCode: HTTP_STATUS.OK
        };
      }

      return {
        success: true,
        data: appointments,
        message: 'Shop appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_SHOP_APPOINTMENTS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByStaffId(
    staffId: string,
    options: { page?: number; limit?: number; date?: string } = {}
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(staffId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointments = await this.appointmentRepository.findByStaffId(idValidation.objectId!, options);

      if (options.date) {
        const filteredAppointments = appointments.filter(appt => {
          return appt.slotDetails.date === options.date;
        });
        return {
          success: true,
          data: filteredAppointments,
          message: 'Staff appointments retrieved successfully',
          statusCode: HTTP_STATUS.OK
        };
      }

      return {
        success: true,
        data: appointments,
        message: 'Staff appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_STAFF_APPOINTMENTS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByStatus(
    status: string,
    options: { shopId?: string; page?: number; limit?: number } = {}
  ): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    message: string;
    statusCode: number;
  }> {
    try {
      if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      let shopId: Types.ObjectId | undefined;
      if (options.shopId) {
        const idValidation = this.validateId(options.shopId);
        if (!idValidation.isValid) {
          return {
            success: false,
            message: ERROR_MESSAGES.INVALID_ID,
            statusCode: HTTP_STATUS.BAD_REQUEST
          };
        }
        shopId = idValidation.objectId;
      }

      const appointments = await this.appointmentRepository.findByStatus(status as AppointmentStatus, shopId, options);

      return {
        success: true,
        data: appointments,
        message: 'Appointments by status retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS_BY_STATUS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async checkSlotAvailability(
    slotDetails: { startTime: string; endTime: string; date: string },
    staffId: string
  ): Promise<{
    success: boolean;
    data?: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      if (!this.validateSlotDetails(slotDetails)) {
        return {
          success: false,
          message: 'Invalid slotDetails format or values',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!Types.ObjectId.isValid(staffId)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const isAvailable = await this.appointmentRepository.isTimeSlotAvailable(
        new Types.ObjectId(staffId),
        slotDetails.date,
        slotDetails.startTime,
        slotDetails.endTime
      );

      return {
        success: true,
        data: isAvailable,
        message: isAvailable ? 'Slot is available' : 'Slot is not available',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CHECK_SLOT_AVAILABILITY,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async deleteAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(appointmentId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this.appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      const deleted = await this.appointmentRepository.delete(appointmentObjectId);

      return {
        success: true,
        data: existingAppointment,
        message: 'Appointment deleted successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_DELETE_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async confirmAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(appointmentId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this.appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Booked) {
        return {
          success: false,
          message: 'Appointment is already confirmed',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const updateResult = await this.appointmentRepository.update(appointmentObjectId, {
        appointmentStatus: AppointmentStatus.Booked,
        requestStatus: RequestStatus.Completed
      });

      return {
        success: true,
        data: updateResult,
        message: 'Appointment confirmed successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CONFIRM_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async completeAppointment(appointmentId: string): Promise<{
    success: boolean;
    data?: AppointmentDocument | null;
    message: string;
    statusCode: number;
  }> {
    try {
      const idValidation = this.validateId(appointmentId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this.appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Completed) {
        return {
          success: false,
          message: 'Appointment is already completed',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const updateResult = await this.appointmentRepository.update(appointmentObjectId, {
        appointmentStatus: AppointmentStatus.Completed,
        requestStatus: RequestStatus.Completed
      });

      return {
        success: true,
        data: updateResult,
        message: 'Appointment completed successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_COMPLETE_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsCount(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      return await this.appointmentRepository.getAppointmentsCount(shopId, startDate, endDate);
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS_COUNT);
    }
  }
}