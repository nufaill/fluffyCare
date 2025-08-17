import { Request, Response } from 'express';

export interface IAppointmentController {
  createAppointment(req: Request, res: Response): Promise<void>;
  updateAppointment(req: Request, res: Response): Promise<void>;
  cancelAppointment(req: Request, res: Response): Promise<void>;
  getAppointmentById(req: Request, res: Response): Promise<void>;
  getAppointmentsByUserId(req: Request, res: Response): Promise<void>;
  getAppointmentsByShopId(req: Request, res: Response): Promise<void>;
  getAppointmentsByStaffId(req: Request, res: Response): Promise<void>;
  getAppointmentsByStatus(req: Request, res: Response): Promise<void>;
  confirmAppointment(req: Request, res: Response): Promise<void>;
  completeAppointment(req: Request, res: Response): Promise<void>;
  checkSlotAvailability(req: Request, res: Response): Promise<void>;
  startOngoingAppointment(req: Request, res: Response): Promise<void>;
}