export interface INotificationController {
  createNotification(req: Request, res: Response): Promise<void>;
  updateNotification(req: Request, res: Response): Promise<void>;
  deleteNotification(req: Request, res: Response): Promise<void>;
}
