import { Schema, model, Document } from "mongoose";

export interface ChatDocument extends Document {
  userId: Schema.Types.ObjectId;
  shopId: Schema.Types.ObjectId;
  lastMessage: string;
  lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File";
  lastMessageAt: Date | null;
  unreadCount: number;
}

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

// Notification on new chat creation
chatSchema.post<ChatDocument>("save", async function (doc) {
  // Only trigger for new documents
  // if (!this.isNew) return;

  try {
    const { NotificationModel } = await import('../models/notifications.model');
    
    // Notify shop about new chat
    await NotificationModel.create({
      userId: doc.userId,
      shopId: doc.shopId,
      receiverType: 'Shop',
      type: 'Chat',
      message: `New chat conversation started`,
      isRead: false,
    });
  } catch (error) {
    console.error('Error creating chat notification:', error);
  }
});

export const ChatModel = model<ChatDocument>("Chat", chatSchema);