import { Document, Types } from "mongoose";

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  plan: string;                       // Plan name (set by admin)
  description: string;
  durationInDays: number;
  price: number;                      // Price for the plan
  profitPercentage: number;           // Admin profit from each booking
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
