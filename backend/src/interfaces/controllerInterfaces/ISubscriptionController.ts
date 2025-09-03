import { Request, Response } from 'express';

export interface ISubscriptionController {
    createSubscription(req: Request, res: Response): Promise<void>;
    updateSubscription(req: Request, res: Response): Promise<void>;
    getAllSubscriptions(req: Request, res: Response): Promise<void>;
    getAllActiveSubscriptions(req: Request, res: Response): Promise<void>;
}