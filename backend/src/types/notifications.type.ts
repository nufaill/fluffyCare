// notifications.type.ts
import { Types, Document } from "mongoose";

export type ReceiverType = "User" | "Shop";

export type NotificationType =
  | "Booking Update"
  | "Payment"
  | "Chat"
  | "System Alert";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  shopId: Types.ObjectId;
  receiverType: ReceiverType;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
