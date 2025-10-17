import { Schema, model, Document } from "mongoose";

interface Reaction {
  userId: Schema.Types.ObjectId;
  emoji: string;
  reactedAt: Date;
}

export interface MessageDocument extends Document {
  chatId: Schema.Types.ObjectId;
  senderRole: "User" | "Shop";
  messageType: "Text" | "Image" | "Video" | "Audio" | "File";
  content: string;
  mediaUrl: string;
  isRead: boolean;
  deliveredAt?: Date;
  readAt?: Date;
  reactions: Reaction[];
}

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

// Notification on new message
messageSchema.post<MessageDocument>("save", async function (doc) {
  // if (!this.isNew) return;

  try {
    const { NotificationModel } = await import('../models/notifications.model');
    const { ChatModel } = await import('./chat.model');
    
    const chat = await ChatModel.findById(doc.chatId);
    if (!chat) return;

    const receiverType = doc.senderRole === 'Shop' ? 'User' : 'Shop';
    const messageTypeText = doc.messageType.toLowerCase();
    
    await NotificationModel.create({
      userId: doc.senderRole === 'Shop' ? chat.userId : doc.senderRole === 'User' ? chat.shopId : null,
      shopId: chat.shopId,
      receiverType,
      type: 'Chat',
      message: `New ${messageTypeText} message received`,
      isRead: false,
    });
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
});

export const MessageModel = model<MessageDocument>("Message", messageSchema);