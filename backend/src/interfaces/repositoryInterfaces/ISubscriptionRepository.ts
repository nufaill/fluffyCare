import { Types } from "mongoose";
import { ISubscription } from "types/subscription.type";
interface SubscriptionPaginatedResult {
  subscriptions: ISubscription[];
  total: number;
  page: number;
  limit: number;
}

 export interface ISubscriptionRepository {
  createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription>;
  updateSubscription(subscriptionId: Types.ObjectId, updateData: Partial<ISubscription>): Promise<ISubscription | null>;
  getAllSubscriptions( filter:any, page: number, limit: number): Promise<SubscriptionPaginatedResult>;
}