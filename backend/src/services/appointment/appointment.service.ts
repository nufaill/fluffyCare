import { Types } from 'mongoose';
import { IAppointmentRepository } from '../../interfaces/repositoryInterfaces/IAppointmentRepository';
import { AppointmentDocument } from '../../models/appointment.model';
import { IAppointment, AppointmentStatus, PaymentStatus, PaymentMethod, PaymentDetails } from '../../types/appointment.types';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../../dto/appointment.dto';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { IWalletService } from '../../interfaces/serviceInterfaces/IWalletService';
import { getSocketHandler } from '../../shared/socket.io-handler';
import { ProcessPaymentDto, RefundPaymentDto } from '../../dto/wallet.dto';
import { IAppointmentService } from '../../interfaces/serviceInterfaces/IAppointmentService';

interface TimeSlot {
  shopId: string;
  staffId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: 'booked';
}

export class AppointmentService implements IAppointmentService {
  constructor(
    private _appointmentRepository: IAppointmentRepository,
    private _walletService: IWalletService
  ) { }

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
        !appointmentData.slotDetails.date ||
        !appointmentData.slotDetails.startTime ||
        !appointmentData.slotDetails.endTime ||
        !appointmentData.paymentMethod
      ) {
        return {
          success: false,
          message: ERROR_MESSAGES.MISSING_REQUIRED_FIELD,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

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

      const staffId = new Types.ObjectId(appointmentData.staffId);
      const isSlotAvailable = await this._appointmentRepository.isTimeSlotAvailable(
        staffId,
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

      const isSlotBooked = await this._appointmentRepository.isSlotBooked(
        new Types.ObjectId(appointmentData.shopId),
        staffId,
        appointmentData.slotDetails.date,
        appointmentData.slotDetails.startTime
      );

      if (isSlotBooked) {
        return {
          success: false,
          message: 'This slot has just been booked by another user',
          statusCode: HTTP_STATUS.CONFLICT,
        };
      }

      const appointmentToCreate: Partial<IAppointment> = {
        ...appointmentData,
        userId: new Types.ObjectId(appointmentData.userId),
        petId: new Types.ObjectId(appointmentData.petId),
        shopId: new Types.ObjectId(appointmentData.shopId),
        staffId,
        serviceId: new Types.ObjectId(appointmentData.serviceId),
        slotDetails: appointmentData.slotDetails,
        appointmentStatus: appointmentData.appointmentStatus || AppointmentStatus.Pending,
        paymentDetails: {
          ...appointmentData.paymentDetails,
          status: appointmentData.paymentStatus || PaymentStatus.Pending,
          method: appointmentData.paymentMethod,
        },
      };

      const appointment: AppointmentDocument = await this._appointmentRepository.create(appointmentToCreate);

      // if (appointmentData.paymentMethod === PaymentMethod.Wallet && appointmentData.paymentStatus === PaymentStatus.Completed) {
      //   const paymentDto = new ProcessPaymentDto(
      //     new Types.ObjectId(appointmentData.userId),
      //     new Types.ObjectId(appointmentData.shopId),
      //     appointmentData.paymentDetails?.amount || 0,
      //     appointmentData.paymentDetails?.currency || 'INR',
      //     appointment._id as Types.ObjectId,
      //     'Payment for appointment'
      //   );
      //   await this._walletService.processPayment(paymentDto);
      // }

      try {
        const socketHandler = getSocketHandler();
        socketHandler.emitSlotBooked({
          shopId: appointmentData.shopId,
          staffId: appointmentData.staffId,
          date: appointmentData.slotDetails.date,
          startTime: appointmentData.slotDetails.startTime,
          endTime: appointmentData.slotDetails.endTime,
          appointmentId: appointment._id.toString(),
          userId: appointmentData.userId,
        });
      } catch (socketError) {
        console.error('Failed to emit socket event for slot booking:', socketError);
      }

      return {
        success: true,
        data: appointment,
        message: 'Appointment created successfully',
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

  async getAppointmentStats(shopId: string, startDate: Date, endDate: Date): Promise<{
    success: boolean;
    data?: number;
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

      const count = await this._appointmentRepository.getAppointmentsCount(idValidation.objectId!, startDate, endDate);

      return {
        success: true,
        data: count,
        message: 'Appointment count retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error(error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT_STATS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAllAppointments(params: { page?: number; limit?: number; filters?: any }): Promise<{
    success: boolean;
    data?: any;
    message: string;
    statusCode: number;
  }> {
    try {
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const filters = params.filters || {};
      const result = await this._appointmentRepository.getAllAppointments(filters, page, limit);
      return {
        success: true,
        data: {
          appointments: result.data,
          pagination: { total: result.total, page: result.page, limit: result.limit, pages: Math.ceil(result.total / result.limit) }
        },
        message: 'Appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Get all appointments error:', error);
      return {
        success: false,
        message: 'Failed to retrieve appointments',
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
      const idValidation = this.validateId(staffId);
      if (!idValidation.isValid) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (!this.validateSlotDetails(slotDetails)) {
        return {
          success: false,
          message: 'Invalid slotDetails format or values',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const isAvailable = await this._appointmentRepository.isTimeSlotAvailable(
        idValidation.objectId!,
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
      console.error('Check slot availability error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CHECK_SLOT_AVAILABILITY,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async updateAppointment(appointmentId: string, updateData: UpdateAppointmentDto, isShop?: boolean): Promise<{
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

      if (!updateData || Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_REQUEST_BODY,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (updateData.slotDetails && !this.validateSlotDetails(updateData.slotDetails)) {
        return {
          success: false,
          message: 'Invalid slotDetails format or values',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (!this.validateEnums(updateData)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (updateData.staffId && !Types.ObjectId.isValid(updateData.staffId)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (updateData.serviceId && !Types.ObjectId.isValid(updateData.serviceId)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this._appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (isShop && updateData.appointmentStatus === AppointmentStatus.Cancelled) {
        return {
          success: false,
          message: 'Shops cannot cancel appointments directly',
          statusCode: HTTP_STATUS.FORBIDDEN
        };
      }

      let slotAvailable = true;
      if (updateData.slotDetails && updateData.staffId) {
        slotAvailable = await this._appointmentRepository.isTimeSlotAvailable(
          new Types.ObjectId(updateData.staffId),
          updateData.slotDetails.date,
          updateData.slotDetails.startTime,
          updateData.slotDetails.endTime,
          appointmentObjectId
        );
      }

      if (!slotAvailable) {
        return {
          success: false,
          message: ERROR_MESSAGES.SLOT_NOT_AVAILABLE,
          statusCode: HTTP_STATUS.CONFLICT
        };
      }

      const updateObject: Partial<IAppointment> = {
        ...updateData,
        staffId: updateData.staffId ? new Types.ObjectId(updateData.staffId) : undefined,
        serviceId: updateData.serviceId ? new Types.ObjectId(updateData.serviceId) : undefined,
        paymentDetails: updateData.paymentDetails
          ? {
            ...updateData.paymentDetails,
            status: updateData.paymentStatus || existingAppointment.paymentDetails?.status,
            method: updateData.paymentMethod || existingAppointment.paymentDetails?.method
          }
          : existingAppointment.paymentDetails
      };

      const updatedAppointment = await this._appointmentRepository.update(appointmentObjectId, updateObject);

      if (updatedAppointment && updateData.slotDetails) {
        try {
          const socketHandler = getSocketHandler();
          socketHandler.emitSlotBooked({
            shopId: updatedAppointment.shopId.toString(),
            staffId: updatedAppointment.staffId.toString(),
            date: updateData.slotDetails.date,
            startTime: updateData.slotDetails.startTime,
            endTime: updateData.slotDetails.endTime,
            appointmentId: updatedAppointment._id.toString(),
            userId: updatedAppointment.userId.toString()
          });
        } catch (socketError) {
          console.error('Failed to emit socket event for slot update:', socketError);
        }
      }

      return {
        success: true,
        data: updatedAppointment,
        message: 'Appointment updated successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Update appointment error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT,
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

      const appointment = await this._appointmentRepository.findById(idValidation.objectId!);

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
      console.error('Get appointment by ID error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByUserId(userId: string, options?: { page?: number; limit?: number; status?: string }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
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

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const status = options?.status;

      if (status && !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const { items, total } = await this._appointmentRepository.findByUserId(idValidation.objectId!, { page, limit, status });

      return {
        success: true,
        data: items,
        meta: {
          total,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Get appointments by user ID error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_USER_APPOINTMENTS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByShopId(shopId: string, options?: { page?: number; limit?: number; status?: string; date?: string }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
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

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const status = options?.status;
      const date = options?.date;

      if (status && !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const { items, total } = await this._appointmentRepository.findByShopId(idValidation.objectId!, { page, limit, status, date });

      return {
        success: true,
        data: items,
        meta: {
          total,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Get appointments by shop ID error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_SHOP_APPOINTMENTS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByStaffId(staffId: string, options?: { page?: number; limit?: number; date?: string }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
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

      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const date = options?.date;

      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const { items, total } = await this._appointmentRepository.findByStaffId(idValidation.objectId!, { page, limit, date });

      return {
        success: true,
        data: items,
        meta: {
          total,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Get appointments by staff ID error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_STAFF_APPOINTMENTS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getAppointmentsByStatus(status: string, options?: { shopId?: string; page?: number; limit?: number }): Promise<{
    success: boolean;
    data?: AppointmentDocument[];
    meta?: { total: number; currentPage: number; pageSize: number; totalPages: number };
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

      const shopId = options?.shopId;
      if (shopId && !Types.ObjectId.isValid(shopId)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const page = options?.page || 1;
      const limit = options?.limit || 10;

      const { items, total } = await this._appointmentRepository.findByStatus(
        status as AppointmentStatus,
        shopId ? new Types.ObjectId(shopId) : undefined,
        { page, limit }
      );

      return {
        success: true,
        data: items,
        meta: {
          total,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Appointments retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Get appointments by status error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS_BY_STATUS,
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
      const existingAppointment = await this._appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Confirmed) {
        return {
          success: false,
          message: 'Appointment is already confirmed',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const updateResult = await this._appointmentRepository.update(appointmentObjectId, {
        appointmentStatus: AppointmentStatus.Confirmed
      });

      return {
        success: true,
        data: updateResult,
        message: 'Appointment confirmed successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Confirm appointment error:', error);
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
      const existingAppointment = await this._appointmentRepository.findById(appointmentObjectId);

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

      const updateResult = await this._appointmentRepository.update(appointmentObjectId, {
        appointmentStatus: AppointmentStatus.Completed,
      });

      return {
        success: true,
        data: updateResult,
        message: 'Appointment completed successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Complete appointment error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_COMPLETE_APPOINTMENT,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async startOngoingAppointment(appointmentId: string): Promise<{
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
      const existingAppointment = await this._appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Ongoing) {
        return {
          success: false,
          message: 'Appointment is already ongoing',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (existingAppointment.appointmentStatus !== AppointmentStatus.Confirmed) {
        return {
          success: false,
          message: 'Only confirmed appointments can be marked as ongoing',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const updateResult = await this._appointmentRepository.update(appointmentObjectId, {
        appointmentStatus: AppointmentStatus.Ongoing,
      });

      return {
        success: true,
        data: updateResult,
        message: 'Appointment marked as ongoing successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Start ongoing appointment error:', error);
      return {
        success: false,
        message: 'Failed to start ongoing appointment',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async cancelAppointment(appointmentId: string, reason: string): Promise<{
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
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!reason || reason.trim() === '') {
        return {
          success: false,
          message: 'Cancellation reason is required',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const appointmentObjectId = idValidation.objectId!;
      const existingAppointment = await this._appointmentRepository.findById(appointmentObjectId);

      if (!existingAppointment) {
        return {
          success: false,
          message: ERROR_MESSAGES.APPOINTMENT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND,
        };
      }

      if (existingAppointment.appointmentStatus === AppointmentStatus.Cancelled) {
        return {
          success: false,
          message: 'Appointment is already cancelled',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const updateData: Partial<IAppointment> = {
        appointmentStatus: AppointmentStatus.Cancelled,
        notes: reason,
      };

      if (existingAppointment.paymentDetails) {
        const { amount, currency } = existingAppointment.paymentDetails;
        if (!amount || !currency) {
          return {
            success: false,
            message: 'Missing payment details for refund',
            statusCode: HTTP_STATUS.BAD_REQUEST,
          };
        }

        const refundDto = new RefundPaymentDto(
          appointmentObjectId,
          amount,
          currency,
          `Refund due to cancellation: ${reason}`
        );

        await this._walletService.refundPayment(refundDto);

        updateData.paymentDetails = {
          ...existingAppointment.paymentDetails,
          status: PaymentStatus.Refunded,
        };
      }

      const updateResult = await this._appointmentRepository.update(appointmentObjectId, updateData);

      return {
        success: true,
        data: updateResult,
        message: 'Appointment soft cancelled successfully',
        statusCode: HTTP_STATUS.OK,
      };
    } catch (error: any) {
      console.error('Soft cancel appointment error:', error);
      return {
        success: false,
        message: 'Failed to soft cancel appointment',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAppointmentsCount(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      return await this._appointmentRepository.getAppointmentsCount(shopId, startDate, endDate);
    } catch (error: any) {
      throw new Error(ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS_COUNT);
    }
  }

  async getAvailableSlots(
    shopId: string,
    date: string,
    staffId?: string
  ): Promise<{
    success: boolean;
    data?: TimeSlot[];
    message: string;
    statusCode: number;
  }> {
    try {
      if (!Types.ObjectId.isValid(shopId)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      if (staffId && !Types.ObjectId.isValid(staffId)) {
        return {
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }

      const filter: any = {
        shopId: new Types.ObjectId(shopId),
        'slotDetails.date': date,
        appointmentStatus: { $ne: AppointmentStatus.Cancelled }
      };

      if (staffId) {
        filter.staffId = new Types.ObjectId(staffId);
      }

      const bookedSlots = await this._appointmentRepository.findBookedSlots(filter);

      const bookedSlotKeys = new Set(
        bookedSlots.map(slot =>
          `${slot.staffId}-${slot.slotDetails.date}-${slot.slotDetails.startTime}`
        )
      );

      return {
        success: true,
        data: Array.from(bookedSlotKeys).map(key => {
          const [staffId, date, startTime] = key.split('-');
          const slot = bookedSlots.find(s =>
            s.staffId.toString() === staffId &&
            s.slotDetails.date === date &&
            s.slotDetails.startTime === startTime
          );
          return {
            shopId,
            staffId,
            slotDate: date,
            startTime,
            endTime: slot?.slotDetails.endTime || '',
            status: 'booked' as const
          };
        }),
        message: 'Booked slots retrieved successfully',
        statusCode: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error('Get available slots error:', error);
      return {
        success: false,
        message: 'Failed to retrieve available slots',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  async getBookingAnalytics(
    startDate?: string,
    endDate?: string,
    shopId?: string
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
    statusCode: number;
  }> {
    try {
      const now = new Date();
      const defaultStartDate = new Date(now.setDate(now.getDate() - 180)); // Default to last 6 months
      const parsedStartDate = startDate ? new Date(startDate) : defaultStartDate;
      const parsedEndDate = endDate ? new Date(endDate) : new Date();

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return {
          success: false,
          message: 'Invalid date format',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      let shopObjectId: Types.ObjectId | undefined;
      if (shopId) {
        const idValidation = this.validateId(shopId);
        if (!idValidation.isValid) {
          return {
            success: false,
            message: ERROR_MESSAGES.INVALID_ID,
            statusCode: HTTP_STATUS.BAD_REQUEST,
          };
        }
        shopObjectId = idValidation.objectId;
      }

      const data = await this._appointmentRepository.getBookingAnalytics(
        parsedStartDate,
        parsedEndDate,
        shopObjectId
      );

      return {
        success: true,
        data,
        message: 'Booking analytics retrieved successfully',
        statusCode: HTTP_STATUS.OK,
      };
    } catch (error: any) {
      console.error('Get booking analytics error:', error);
      return {
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT_STATS,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

}