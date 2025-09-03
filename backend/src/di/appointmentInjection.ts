// di/appointmentInjection.ts (updated)
import { AppointmentController } from "../controllers/appointment/appointment.controller";
import { PaymentController } from "../controllers/payment/payment.controller";
import { AppointmentService } from "../services/appointment/appointment.service";
import { AppointmentRepository } from "../repositories/appointment/appointment.repository";
import { walletDependencies } from "./walletInjection"; 
import { WalletRepository } from "repositories/wallet/wallet.repository";
import { WalletService } from "services/wallet/wallet.service";

// Create repositories
const appointmentRepository = new AppointmentRepository();
const walletRepository = new WalletRepository();

// Create services
const walletService = new WalletService(walletRepository);
const appointmentService = new AppointmentService(appointmentRepository, walletService);

// Set circular dependency
walletService.setAppointmentService(appointmentService);

// Create controller with both services
const paymentController = new PaymentController(appointmentService, walletService);
const appointmentController = new AppointmentController(appointmentService)

export const appointmentDependencies = {
  paymentController,
  appointmentService,
  walletService,
  appointmentRepository,
  walletRepository,
  appointmentController
};