import { Types } from "mongoose";
import { MessageModel } from "../models/message.model";
import { Message, MessageDocument, Reaction } from "../types/Message.types";
import { IMessageRepository } from '../interfaces/repositoryInterfaces/IMessageRepository';

export class MessageRepository implements IMessageRepository {
  /**
   * Create a new message
   */
  async createMessage(messageData: Partial<Message>): Promise<MessageDocument> {
    try {
      const message = new MessageModel(messageData);
      const savedMessage = await message.save();
      
      // Get the populated message
      const populatedMessage = await this.findMessageById(savedMessage._id as Types.ObjectId);
      if (!populatedMessage) {
        throw new Error("Failed to retrieve created message");
      }
      
      return populatedMessage;
    } catch (error) {
      throw new Error(`Error creating message: ${error}`);
    }
  }

  /**
   * Find message by ID with populated data
   */
  async findMessageById(messageId: Types.ObjectId | string): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findById(messageId)
        .populate({
          path: "chatId",
          populate: [
            { path: "userId", select: "fullName email profileImage phone" },
            { path: "shopId", select: "name email logo phone city" }
          ]
        })
        .populate("reactions.userId", "fullName profileImage")
        .lean();
    } catch (error) {
      throw new Error(`Error finding message by ID: ${error}`);
    }
  }

  /**
   * Get messages for a chat with pagination
   */
  async getChatMessages(
    chatId: Types.ObjectId | string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: MessageDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [messages, total] = await Promise.all([
        MessageModel.find({ chatId: new Types.ObjectId(chatId) })
          .populate({
            path: "chatId",
            populate: [
              { path: "userId", select: "fullName email profileImage phone" },
              { path: "shopId", select: "name email logo phone city" }
            ]
          })
          .populate("reactions.userId", "fullName profileImage")
          .sort({ createdAt: -1 }) // Latest messages first
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments({ chatId: new Types.ObjectId(chatId) })
      ]);

      return {
        messages: messages.reverse(), // Reverse to show oldest first in UI
        total,
        hasMore: skip + messages.length < total
      };
    } catch (error) {
      throw new Error(`Error getting chat messages: ${error}`);
    }
  }

  /**
   * Get latest message for a chat
   */
  async getLatestMessage(chatId: Types.ObjectId | string): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findOne({ chatId: new Types.ObjectId(chatId) })
        .sort({ createdAt: -1 })
        .populate("reactions.userId", "fullName profileImage")
        .lean();
    } catch (error) {
      throw new Error(`Error getting latest message: ${error}`);
    }
  }

  /**
   * Mark message as delivered
   */
  async markAsDelivered(
    messageId: Types.ObjectId | string,
    deliveredAt: Date = new Date()
  ): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(
        messageId,
        { deliveredAt },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error marking message as delivered: ${error}`);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(
    messageId: Types.ObjectId | string,
    readAt: Date = new Date()
  ): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(
        messageId,
        { isRead: true, readAt },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error marking message as read: ${error}`);
    }
  }

  /**
   * Mark multiple messages as read
   */
  async markMultipleAsRead(
    messageIds: (Types.ObjectId | string)[],
    readAt: Date = new Date()
  ): Promise<number> {
    try {
      const objectIds = messageIds.map(id => new Types.ObjectId(id));
      const result = await MessageModel.updateMany(
        { _id: { $in: objectIds }, isRead: false },
        { isRead: true, readAt }
      );
      return result.modifiedCount;
    } catch (error) {
      throw new Error(`Error marking multiple messages as read: ${error}`);
    }
  }

  /**
   * Mark all messages in a chat as read for a specific receiver
   */
  async markChatMessagesAsRead(
    chatId: Types.ObjectId | string,
    receiverRole: "User" | "Shop",
    readAt: Date = new Date()
  ): Promise<number> {
    try {
      // Mark as read all messages that were sent by the other party (not by the receiver)
      const senderRole = receiverRole === "User" ? "Shop" : "User";
      
      const result = await MessageModel.updateMany(
        {
          chatId: new Types.ObjectId(chatId),
          senderRole,
          isRead: false
        },
        { isRead: true, readAt }
      );
      
      return result.modifiedCount;
    } catch (error) {
      throw new Error(`Error marking chat messages as read: ${error}`);
    }
  }

  /**
   * Get unread messages count for a chat
   */
  async getUnreadCount(
    chatId: Types.ObjectId | string,
    receiverRole: "User" | "Shop"
  ): Promise<number> {
    try {
      const senderRole = receiverRole === "User" ? "Shop" : "User";
      
      return await MessageModel.countDocuments({
        chatId: new Types.ObjectId(chatId),
        senderRole,
        isRead: false
      });
    } catch (error) {
      throw new Error(`Error getting unread count: ${error}`);
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    emoji: string
  ): Promise<MessageDocument | null> {
    try {
      // Remove existing reaction from this user if any
      await MessageModel.findByIdAndUpdate(
        messageId,
        { $pull: { reactions: { userId: new Types.ObjectId(userId) } } }
      );

      // Add new reaction
      return await MessageModel.findByIdAndUpdate(
        messageId,
        {
          $push: {
            reactions: {
              userId: new Types.ObjectId(userId),
              emoji,
              reactedAt: new Date()
            }
          }
        },
        { new: true }
      )
        .populate("reactions.userId", "fullName profileImage");
    } catch (error) {
      throw new Error(`Error adding reaction: ${error}`);
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(
    messageId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(
        messageId,
        { $pull: { reactions: { userId: new Types.ObjectId(userId) } } },
        { new: true }
      )
        .populate("reactions.userId", "fullName profileImage");
    } catch (error) {
      throw new Error(`Error removing reaction: ${error}`);
    }
  }

  /**
   * Search messages in a chat
   */
  async searchMessages(
    chatId: Types.ObjectId | string,
    query: string,
    messageType?: "Text" | "Image" | "Video" | "Audio" | "File",
    page: number = 1,
    limit: number = 20
  ): Promise<{
    messages: MessageDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(query, 'i');
      
      let matchCondition: any = {
        chatId: new Types.ObjectId(chatId),
        content: searchRegex
      };

      if (messageType) {
        matchCondition.messageType = messageType;
      }

      const [messages, total] = await Promise.all([
        MessageModel.find(matchCondition)
          .populate("reactions.userId", "fullName profileImage")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments(matchCondition)
      ]);

      return {
        messages,
        total,
        hasMore: skip + messages.length < total
      };
    } catch (error) {
      throw new Error(`Error searching messages: ${error}`);
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: Types.ObjectId | string): Promise<boolean> {
    try {
      const result = await MessageModel.findByIdAndDelete(messageId);
      return !!result;
    } catch (error) {
      throw new Error(`Error deleting message: ${error}`);
    }
  }

  /**
   * Delete all messages in a chat
   */
  async deleteChatMessages(chatId: Types.ObjectId | string): Promise<number> {
    try {
      const result = await MessageModel.deleteMany({ 
        chatId: new Types.ObjectId(chatId) 
      });
      return result.deletedCount;
    } catch (error) {
      throw new Error(`Error deleting chat messages: ${error}`);
    }
  }

  /**
   * Get messages by type in a chat (useful for media galleries)
   */
  async getMessagesByType(
    chatId: Types.ObjectId | string,
    messageType: "Text" | "Image" | "Video" | "Audio" | "File",
    page: number = 1,
    limit: number = 20
  ): Promise<{
    messages: MessageDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [messages, total] = await Promise.all([
        MessageModel.find({
          chatId: new Types.ObjectId(chatId),
          messageType
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments({
          chatId: new Types.ObjectId(chatId),
          messageType
        })
      ]);

      return {
        messages,
        total,
        hasMore: skip + messages.length < total
      };
    } catch (error) {
      throw new Error(`Error getting messages by type: ${error}`);
    }
  }

  /**
   * Get message statistics for a chat
   */
  async getChatMessageStats(chatId: Types.ObjectId | string): Promise<{
    totalMessages: number;
    textMessages: number;
    mediaMessages: number;
    unreadMessages: number;
    totalReactions: number;
  }> {
    try {
      const [stats] = await MessageModel.aggregate([
        { $match: { chatId: new Types.ObjectId(chatId) } },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            textMessages: {
              $sum: { $cond: [{ $eq: ["$messageType", "Text"] }, 1, 0] }
            },
            mediaMessages: {
              $sum: { $cond: [{ $ne: ["$messageType", "Text"] }, 1, 0] }
            },
            unreadMessages: {
              $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
            },
            totalReactions: { $sum: { $size: "$reactions" } }
          }
        }
      ]);

      return stats || {
        totalMessages: 0,
        textMessages: 0,
        mediaMessages: 0,
        unreadMessages: 0,
        totalReactions: 0
      };
    } catch (error) {
      throw new Error(`Error getting chat message stats: ${error}`);
    }
  }
}