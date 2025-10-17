// notifications.model.ts
import mongoose, { Schema, model } from "mongoose";
import { INotification } from "../types/notifications.type";

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    receiverType: {
      type: String,
      enum: ["User", "Shop"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Booking Update", "Payment", "Chat", "System Alert"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

export const NotificationModel =
  mongoose.models.Notification ||
  model<INotification>("Notification", notificationSchema);
