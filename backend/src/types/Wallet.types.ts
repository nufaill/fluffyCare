import { Types } from "mongoose";

export interface IWallet {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId; // Could be user, shop, or admin
  ownerType: "user" | "shop" | "admin";
  balance: number;
  currency: string; // e.g., 'USD', 'INR'
  transactions: IWalletTransaction[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWalletTransaction {
  _id?: Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  currency: string;
  description: string;
  referenceId?: Types.ObjectId; // appointmentId, refundId, etc.
  createdAt?: Date;
}
