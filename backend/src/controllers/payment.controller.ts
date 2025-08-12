import { Request, Response } from "express";
import Stripe from "stripe";
import { AppointmentService } from "../services/appointment.service";
import { HTTP_STATUS } from "../shared/constant";
import { AppointmentStatus, PaymentMethod, PaymentStatus, RequestStatus } from "../types/appointment.types";
import { CreateAppointmentDto } from "../dto/appointment.dto";
import { Types } from "mongoose";

export class PaymentController {
  private appointmentService: AppointmentService;
  private stripe: Stripe;

  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-06-30.basil",
    });

    this.createPaymentIntent = this.createPaymentIntent.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
  }

  createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency, serviceId, shopId, userId, petId, staffId, date, startTime, endTime } = req.body;

      // Define required fields (excluding userId as it's optional for guests)
      const requiredFields = [
        { field: 'amount', value: amount },
        { field: 'currency', value: currency },
        { field: 'petId', value: petId },
        { field: 'shopId', value: shopId },
        { field: 'serviceId', value: serviceId },
        { field: 'staffId', value: staffId },
        { field: 'date', value: date },
        { field: 'startTime', value: startTime },
        { field: 'endTime', value: endTime }
      ];

      // Check for missing or empty required fields
      const missingField = requiredFields.find(({ value }) =>
        value === undefined || value === null || value === ""
      );

      if (missingField) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Missing required field: ${missingField.field}`,
        });
        return;
      }

      const slotDetails = { date, startTime, endTime };
      const availabilityResponse = await this.appointmentService.checkSlotAvailability(slotDetails, staffId);

      if (!availabilityResponse.success || !availabilityResponse.data) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Selected slot is no longer available",
        });
        return;
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          serviceId,
          shopId,
          ...(userId && { userId }),
          petId,
          staffId,
          date,
          startTime,
          endTime,
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Create payment intent error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to create payment intent: ${error.message}`,
      });
    }
  };

  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Confirm Payment Request Body:", JSON.stringify(req.body, null, 2));

      const {
        paymentIntentId,
        serviceId,
        shopId,
        userId,
        petId,
        staffId,
        date,
        startTime,
        endTime,
      } = req.body;

      const requiredFields = [
        { field: 'paymentIntentId', value: paymentIntentId },
        { field: 'serviceId', value: serviceId },
        { field: 'shopId', value: shopId },
        { field: 'userId', value: userId },
        { field: 'petId', value: petId },
        { field: 'staffId', value: staffId },
        { field: 'date', value: date },
        { field: 'startTime', value: startTime },
        { field: 'endTime', value: endTime },
      ];

      const missingField = requiredFields.find(({ value }) =>
        value === undefined || value === null || value === "",
      );

      if (missingField) {
        console.error(`Missing required field: ${missingField.field}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Missing required field: ${missingField.field}`,
          data: null,
        });
        return;
      }

      const objectIdFields = [
        { field: 'serviceId', value: serviceId },
        { field: 'shopId', value: shopId },
        { field: 'userId', value: userId },
        { field: 'petId', value: petId },
        { field: 'staffId', value: staffId },
      ];

      const invalidObjectIdField = objectIdFields.find(({ value }) =>
        !Types.ObjectId.isValid(value),
      );

      if (invalidObjectIdField) {
        console.error(`Invalid ObjectId for field: ${invalidObjectIdField.field}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Invalid ${invalidObjectIdField.field} format`,
          data: null,
        });
        return;
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        console.error(`Payment not completed. Status: ${paymentIntent.status}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Payment has not been completed successfully",
          data: null,
        });
        return;
      }

      // ✅ CORRECTED: Structure the data according to what appointment service expects
      const appointmentData = {
        userId,
        petId,
        shopId,
        serviceId,
        staffId,
        slotDetails: {
          date,
          startTime,
          endTime
        },
        paymentMethod: PaymentMethod.Card,
        paymentStatus: PaymentStatus.Completed,
        appointmentStatus: AppointmentStatus.Confirmed,
        requestStatus: RequestStatus.Approved,
        notes: "",
      };

      console.log("Creating appointment with corrected structure:", JSON.stringify(appointmentData, null, 2));

      const result = await this.appointmentService.createAppointment(appointmentData);

      if (!result.success) {
        console.error("Failed to create appointment:", result.message);
        res.status(result.statusCode).json({
          success: false,
          message: result.message,
          data: null,
        });
        return;
      }

      console.log("Appointment created successfully:", result.data);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment confirmed and appointment created successfully",
        data: result.data,
      });
    } catch (error: any) {
      console.error("Confirm payment error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to confirm payment: ${error.message}`,
        data: null,
      });
    }
  }
}