import { Request, Response } from "express";
import Stripe from "stripe";
import { AppointmentService } from "../../services/appointment/appointment.service";
import { WalletService } from "../../services/wallet/wallet.service";
import { HTTP_STATUS } from "../../shared/constant";
import { AppointmentStatus, PaymentMethod, PaymentStatus } from "../../types/appointment.types";
import { CreateAppointmentDto } from "../../dto/appointment.dto";
import { Types } from "mongoose";
import { CreateWalletDto } from "../../dto/wallet.dto";

export class PaymentController {
  private appointmentService: AppointmentService;
  private walletService: WalletService;
  private stripe: Stripe;

  constructor(appointmentService: AppointmentService, walletService: WalletService) {
    this.appointmentService = appointmentService;
    this.walletService = walletService;
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

  private async ensureWalletExists(ownerId: Types.ObjectId, ownerType: 'user' | 'shop' | 'admin', currency: string): Promise<any> {
    try {
      let wallet = await this.walletService.getWalletByOwner(ownerId, ownerType);

      if (!wallet) {
        const createWalletDto = new CreateWalletDto(ownerId, ownerType, currency);
        wallet = await this.walletService.createWallet(createWalletDto);
      }

      return wallet;
    } catch (error) {
      console.error(`Error ensuring ${ownerType} wallet exists:`, error);
      throw error;
    }
  }

  confirmPayment = async (req: Request, res: Response): Promise<void> => {
    try {

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

      // Validate required fields
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
        value === undefined || value === null || value === ""
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

      // Validate ObjectIds
      const objectIdFields = [
        { field: 'serviceId', value: serviceId },
        { field: 'shopId', value: shopId },
        { field: 'userId', value: userId },
        { field: 'petId', value: petId },
        { field: 'staffId', value: staffId },
      ];

      const invalidObjectIdField = objectIdFields.find(
        ({ value }) => !Types.ObjectId.isValid(value)
      );

      if (invalidObjectIdField) {
        console.error(`Invalid ObjectId for field: ${invalidObjectIdField.field}`);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `Invalid ObjectId for field: ${invalidObjectIdField.field}`,
          data: null,
        });
        return;
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      const paymentAmount = paymentIntent.amount;
      const currency = paymentIntent.currency.toUpperCase();

      const appointmentData: CreateAppointmentDto = {
        userId,
        petId,
        shopId,
        serviceId,
        staffId,
        slotDetails: { date, startTime, endTime },
        paymentDetails: {
          paymentIntentId,
          amount: paymentAmount / 100, // Convert Stripe amount (in cents) to main unit
          currency,
          status: PaymentStatus.Completed,
          method: PaymentMethod.Card,
          paidAt: new Date(),
        },
        paymentMethod: PaymentMethod.Card,
        paymentStatus: PaymentStatus.Completed,
        appointmentStatus: AppointmentStatus.Pending,
        notes: "",
      };

      const appointmentResult = await this.appointmentService.createAppointment(appointmentData);

      if (!appointmentResult.success || !appointmentResult.data) {
        console.error("Failed to create appointment:", appointmentResult.message);
        res.status(appointmentResult.statusCode).json({
          success: false,
          message: appointmentResult.message,
          data: null,
        });
        return;
      }

      const appointmentObjectId = appointmentResult.data._id as Types.ObjectId;

      try {
        const userObjectId = new Types.ObjectId(userId);
        const shopObjectId = new Types.ObjectId(shopId);

        // Get admin ID from environment or use default
        const adminIdEnv = process.env.ADMIN_ID;
        let adminObjectId: Types.ObjectId;

        if (adminIdEnv && Types.ObjectId.isValid(adminIdEnv)) {
          adminObjectId = new Types.ObjectId(adminIdEnv);
        } else {
          adminObjectId = new Types.ObjectId('685ff3212adf35c013419da4');
        }

        const userWallet = await this.ensureWalletExists(userObjectId, 'user', currency);
        const shopWallet = await this.ensureWalletExists(shopObjectId, 'shop', currency);
        const adminWallet = await this.ensureWalletExists(adminObjectId, 'admin', currency);

        if (!userWallet || !shopWallet || !adminWallet) {
          throw new Error("One or more wallets could not be ensured");
        }

        // Get dynamic commission rate based on shop subscription
        const commissionRate = await this.walletService.getCommissionRate(shopObjectId);

        // Calculate commission
        const adminCommission = Math.round((paymentAmount / 100) * commissionRate * 100) / 100;
        const shopAmount = Math.round((paymentAmount / 100 - adminCommission) * 100) / 100;


        await this.walletService.walletRepository.updateBalance(adminWallet._id, adminCommission, 'credit');
        await this.walletService.walletRepository.addTransaction(adminWallet._id, {
          type: 'credit',
          amount: adminCommission,
          currency: currency,
          description: `Commission from appointment ${appointmentObjectId}`,
          referenceId: appointmentObjectId,
        });

        await this.walletService.walletRepository.updateBalance(shopWallet._id, shopAmount, 'credit');
        await this.walletService.walletRepository.addTransaction(shopWallet._id, {
          type: 'credit',
          amount: shopAmount,
          currency: currency,
          description: `Payment for appointment ${appointmentObjectId} (after commission)`,
          referenceId: appointmentObjectId,
        });

        // Verify wallet balances after transaction
        const updatedAdminWallet = await this.walletService.getWalletByOwner(adminObjectId, 'admin');
        const updatedShopWallet = await this.walletService.getWalletByOwner(shopObjectId, 'shop');

        if (!updatedShopWallet || updatedShopWallet.balance < shopAmount) {
          throw new Error(`Shop wallet balance verification failed. Expected at least ${shopAmount}, got ${updatedShopWallet?.balance || 'N/A'}`);
        }

      } catch (walletError: any) {
        console.error("=== WALLET TRANSACTION ERROR ===");
        console.error("Error details:", walletError);
        console.error("Stack trace:", walletError.stack);

        await this.appointmentService.cancelAppointment(
          appointmentObjectId.toString(),
          "Wallet transaction failed during payment confirmation"
        );

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: `Failed to process wallet transactions: ${walletError.message}. Appointment cancelled.`,
          data: null,
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payment confirmed and appointment created successfully",
        data: appointmentResult.data,
      });
    } catch (error: any) {
      console.error("=== PAYMENT CONFIRMATION FAILED ===");
      console.error("Error:", error);
      console.error("Stack trace:", error.stack);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to confirm payment: ${error.message}`,
        data: null,
      });
    }
  };
}