import { AppointmentController } from "../controllers/appointment.controller";
import { PaymentController } from "../controllers/payment.controller";
import { AppointmentService } from "../services/appointment.service";
import { AppointmentRepository } from "../repositories/appointment.repository";

const appointmentRepository = new AppointmentRepository();
const appointmentService = new AppointmentService(appointmentRepository); 
const appointmentController = new AppointmentController(appointmentService);
const paymentController = new PaymentController(appointmentService);

export const appointmentDependencies = {
  appointmentRepository,
  appointmentService,
  appointmentController,
  paymentController
};