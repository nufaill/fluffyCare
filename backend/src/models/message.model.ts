import { Schema, model } from "mongoose";
import { MessageDocument } from "../types/Message.types";

const reactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
    reactedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new Schema<MessageDocument>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderRole: { type: String, enum: ["User", "Shop"], required: true },
    messageType: {
      type: String,
      enum: ["Text", "Image", "Video", "Audio", "File"],
      default: "Text",
    },
    content: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    reactions: { type: [reactionSchema], default: [] },
  },
  { timestamps: true }
);

export const MessageModel = model<MessageDocument>("Message", messageSchema);
