import { Request, Response } from 'express';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../../dto/appointment.dto';
import { IAppointmentController } from '../../interfaces/controllerInterfaces/IAppointmentController';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constant';
import { Types } from 'mongoose';
import { AppointmentStatus } from '../../types/appointment.types';

export class AppointmentController implements IAppointmentController {
  private appointmentService: AppointmentService;
  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
  }

  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentData: CreateAppointmentDto = req.body;

      // Validate required fields with detailed logging
      const requiredFields = [
        { field: 'userId', value: appointmentData.userId },
        { field: 'petId', value: appointmentData.petId },
        { field: 'shopId', value: appointmentData.shopId },
        { field: 'serviceId', value: appointmentData.serviceId },
        { field: 'staffId', value: appointmentData.staffId },
        { field: 'slotDetails.date', value: appointmentData.slotDetails?.date },
        { field: 'slotDetails.startTime', value: appointmentData.slotDetails?.startTime },
        { field: 'slotDetails.endTime', value: appointmentData.slotDetails?.endTime },
        { field: 'paymentDetails', value: appointmentData.paymentDetails },
        { field: 'paymentDetails.paymentIntentId', value: appointmentData.paymentDetails?.paymentIntentId },
        { field: 'paymentDetails.amount', value: appointmentData.paymentDetails?.amount },
        { field: 'paymentDetails.currency', value: appointmentData.paymentDetails?.currency },
        { field: 'paymentDetails.status', value: appointmentData.paymentDetails?.status },
        { field: 'paymentDetails.method', value: appointmentData.paymentDetails?.method },
        { field: 'paymentDetails.paidAt', value: appointmentData.paymentDetails?.paidAt },
        { field: 'paymentMethod', value: appointmentData.paymentMethod },
      ];

      // Log each field check
      for (const { field, value } of requiredFields) {
        const isEmpty = value === undefined || value === null || value === "";
      }

      const missingField = requiredFields.find(({ value }) =>
        value === undefined || value === null || value === ""
      );

      if (missingField) {
        console.error(`MISSING FIELD DETAILS: Field: ${missingField.field}, Value: ${missingField.value}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Missing required field: ${missingField.field}`,
          data: null
        });
        return;
      }

      const objectIdFields = [
        { field: 'userId', value: appointmentData.userId },
        { field: 'petId', value: appointmentData.petId },
        { field: 'shopId', value: appointmentData.shopId },
        { field: 'serviceId', value: appointmentData.serviceId },
        { field: 'staffId', value: appointmentData.staffId },
      ];

      const invalidObjectIdField = objectIdFields.find(({ value }) =>
        !Types.ObjectId.isValid(value)
      );

      if (invalidObjectIdField) {
        console.error(`INVALID OBJECTID: Field: ${invalidObjectIdField.field}, Value: ${invalidObjectIdField.value}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Invalid ObjectId for field: ${invalidObjectIdField.field}`,
          data: null
        });
        return;
      }

      const result = await this.appointmentService.createAppointment(appointmentData);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Create appointment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CREATE_APPOINTMENT,
        data: null
      });
    }
  }

  async getAppointmentStats(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const { startDate, endDate } = req.query;

      if (!Types.ObjectId.isValid(shopId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      if (!startDate || !endDate) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Start date and end date are required',
          data: null
        });
        return;
      }

      const parsedStartDate = new Date(startDate as string);
      const parsedEndDate = new Date(endDate as string);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid date format',
          data: null
        });
        return;
      }

      const appointmentsCount = await this.appointmentService.getAppointmentsCount(
        new Types.ObjectId(shopId),
        parsedStartDate,
        parsedEndDate
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          totalAppointments: appointmentsCount,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          shopId
        },
        message: 'Appointment statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Get appointment stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT_STATS,
        data: null
      });
    }
  }

  async checkSlotAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime, date, staffId } = req.query;

      if (!startTime || !endTime || !date || !staffId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'startTime, endTime, date, and staffId are required',
          data: null
        });
        return;
      }

      const slotDetails = { startTime: startTime as string, endTime: endTime as string, date: date as string };

      const result = await this.appointmentService.checkSlotAvailability(slotDetails, staffId as string);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error: any) {
      console.error('Check slot availability error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CHECK_SLOT_AVAILABILITY,
        data: null
      });
    }
  }

  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const updateData: UpdateAppointmentDto = req.body;

      if (!appointmentId || !Types.ObjectId.isValid(appointmentId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_REQUEST_BODY,
          data: null
        });
        return;
      }

      const result = await this.appointmentService.updateAppointment(appointmentId, updateData);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Update appointment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_UPDATE_APPOINTMENT,
        data: null
      });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;

      if (!appointmentId || !Types.ObjectId.isValid(appointmentId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Cancellation reason is required',
          data: null
        });
        return;
      }

      const result = await this.appointmentService.cancelAppointment(appointmentId, reason);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Soft cancel appointment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to soft cancel appointment',
        data: null
      });
    }
  }

  async getAppointmentById(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId || !Types.ObjectId.isValid(appointmentId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      const result = await this.appointmentService.getAppointmentById(appointmentId);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Get appointment by ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENT,
        data: null
      });
    }
  }

  async getAppointmentsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '10', status } = req.query;

      if (!userId || !Types.ObjectId.isValid(userId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      if (status && !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          data: null
        });
        return;
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

      const result = await this.appointmentService.getAppointmentsByUserId(
        userId,
        { page: pageNum, limit: limitNum, status: status as string }
      );

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
        meta: result.meta
      });
    } catch (error: any) {
      console.error('Get appointments by user ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_USER_APPOINTMENTS,
        data: null
      });
    }
  }

  async getAppointmentsByShopId(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const { page = '1', limit = '10', status, date } = req.query;

      if (!shopId || !Types.ObjectId.isValid(shopId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      if (status && !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          data: null
        });
        return;
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

      const result = await this.appointmentService.getAppointmentsByShopId(
        shopId,
        { page: pageNum, limit: limitNum, status: status as string, date: date as string }
      );

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
        meta: result.meta
      });
    } catch (error: any) {
      console.error('Get appointments by shop ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_SHOP_APPOINTMENTS,
        data: null
      });
    }
  }

  async getAppointmentsByStaffId(req: Request, res: Response): Promise<void> {
    try {
      const { staffId } = req.params;
      const { page = '1', limit = '10', date } = req.query;

      if (!staffId || !Types.ObjectId.isValid(staffId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

      const result = await this.appointmentService.getAppointmentsByStaffId(
        staffId,
        { page: pageNum, limit: limitNum, date: date as string }
      );

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
        meta: result.meta
      });
    } catch (error: any) {
      console.error('Get appointments by staff ID error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_STAFF_APPOINTMENTS,
        data: null
      });
    }
  }

  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const filters: any = { ...req.query } as any;
      delete filters.page;
      delete filters.limit;

      const result = await this.appointmentService.getAllAppointments({ page, limit, filters });
      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || {}
      });
    } catch (error: any) {
      console.error('Get all appointments error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve appointments',
        data: null
      });
    }
  }


  async confirmAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId || !Types.ObjectId.isValid(appointmentId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      const result = await this.appointmentService.confirmAppointment(appointmentId);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Confirm appointment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_CONFIRM_APPOINTMENT,
        data: null
      });
    }
  }

  async completeAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId || !Types.ObjectId.isValid(appointmentId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      const result = await this.appointmentService.completeAppointment(appointmentId);

      res.status(result.statusCode).json({
        success: false,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Complete appointment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_COMPLETE_APPOINTMENT,
        data: null
      });
    }
  }

  async startOngoingAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId || !Types.ObjectId.isValid(appointmentId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      const result = await this.appointmentService.startOngoingAppointment(appointmentId);

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || null
      });
    } catch (error: any) {
      console.error('Start ongoing appointment error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to start ongoing appointment',
        data: null
      });
    }
  }

  async getAppointmentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const { shopId, page = '1', limit = '10' } = req.query;

      if (!status || !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ENUM_VALUE,
          data: null
        });
        return;
      }

      if (shopId && !Types.ObjectId.isValid(shopId as string)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

      const result = await this.appointmentService.getAppointmentsByStatus(
        status as string,
        { shopId: shopId as string, page: pageNum, limit: limitNum }
      );

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || [],
        meta: result.meta
      });
    } catch (error: any) {
      console.error('Get appointments by status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.FAILED_TO_GET_APPOINTMENTS_BY_STATUS,
        data: null
      });
    }
  }

  async getBookedSlots(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;
      const { date, staffId } = req.query;

      // Validate required parameters
      if (!shopId || !Types.ObjectId.isValid(shopId)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_ID,
          data: null
        });
        return;
      }

      if (!date || typeof date !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Date parameter is required',
          data: null
        });
        return;
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
          data: null
        });
        return;
      }

      // Validate staffId if provided
      if (staffId && !Types.ObjectId.isValid(staffId as string)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid staff ID',
          data: null
        });
        return;
      }

      const result = await this.appointmentService.getAvailableSlots(
        shopId,
        date,
        staffId as string | undefined
      );

      res.status(result.statusCode).json({
        success: result.success,
        message: result.message,
        data: result.data || []
      });
    } catch (error: any) {
      console.error('Get booked slots error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to retrieve booked slots',
        data: null
      });
    }
  }
}