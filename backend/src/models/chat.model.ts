import { Schema, model, Document } from "mongoose";
import { ChatDocument } from "../types/Chat.types";

const chatSchema = new Schema<ChatDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageType: {
      type: String,
      enum: ["Text", "Image", "Video", "Audio", "File"],
      default: "Text",
    },
    lastMessageAt: { type: Date, default: null },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ChatModel = model<ChatDocument>("Chat", chatSchema);
