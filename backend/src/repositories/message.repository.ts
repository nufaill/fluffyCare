import { Types } from 'mongoose';
import { MessageModel } from '../models/message.model';
import { Message, MessageDocument, Reaction } from '../types/Message.types';
import { IMessageRepository } from '../interfaces/repositoryInterfaces/IMessageRepository';

export class MessageRepository implements IMessageRepository {
  
  async getUnreadCount(chatId: string, receiverRole: string): Promise<number> {
    try {
      const senderRole = receiverRole === 'User' ? 'Shop' : 'User';
      const count = await MessageModel.countDocuments({
        chatId: new Types.ObjectId(chatId),
        senderRole,
        isRead: false,
        _id: { $exists: true },
      });
      return count;
    } catch (error) {
      throw new Error(`Error getting unread count: ${error}`);
    }
  }

  async createMessage(messageData: Partial<Message>): Promise<MessageDocument> {
    try {
      const message = new MessageModel(messageData);
      const savedMessage = await message.save();
      const populatedMessage = await this.findMessageById(savedMessage._id as Types.ObjectId);

      if (!populatedMessage) {
        throw new Error('Failed to retrieve created message');
      }

      return populatedMessage;
    } catch (error) {
      throw new Error(`Error creating message: ${error}`);
    }
  }

  async findMessageById(messageId: Types.ObjectId | string): Promise<MessageDocument | null> {
    try {
      const message = await MessageModel.findById(messageId)
        .populate({
          path: 'chatId',
          populate: [
            { path: 'userId', select: 'fullName email profileImage phone' },
            { path: 'shopId', select: 'name email logo phone city' },
          ],
        })
        .populate('reactions.userId', 'fullName profileImage')
        .lean();

      if (message && !message._id) {
        console.warn(`Message found but missing _id: ${messageId}`);
        return null;
      }

      return message;
    } catch (error) {
      throw new Error(`Error finding message by ID: ${error}`);
    }
  }

  async getChatMessages(
    chatId: Types.ObjectId | string,
    page: number = 1,
    limit: number = 50,
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
          _id: { $exists: true },
          senderRole: { $exists: true },
          messageType: { $exists: true },
        })
          .populate({
            path: 'chatId',
            populate: [
              { path: 'userId', select: 'fullName email profileImage phone' },
              { path: 'shopId', select: 'name email logo phone city' },
            ],
          })
          .populate('reactions.userId', 'fullName profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments({
          chatId: new Types.ObjectId(chatId),
          _id: { $exists: true },
          senderRole: { $exists: true },
          messageType: { $exists: true },
        }),
      ]);

      const validMessages = messages.filter((msg) => {
        if (!msg || !msg._id) {
          console.warn(`Filtered out invalid message in chat ${chatId}:`, msg);
          return false;
        }
        return true;
      });

      return {
        messages: validMessages.reverse(),
        total,
        hasMore: skip + validMessages.length < total,
      };
    } catch (error) {
      console.error(`Error getting chat messages for chat ${chatId}:`, error);
      throw new Error(`Error getting chat messages: ${error}`);
    }
  }

  async getLatestMessage(chatId: Types.ObjectId | string): Promise<MessageDocument | null> {
    try {
      const message = await MessageModel.findOne({
        chatId: new Types.ObjectId(chatId),
        _id: { $exists: true },
        senderRole: { $exists: true },
        messageType: { $exists: true },
      })
        .sort({ createdAt: -1 })
        .populate('reactions.userId', 'fullName profileImage')
        .lean();

      if (message && !message._id) {
        console.warn(`Latest message found but missing _id for chat ${chatId}`);
        return null;
      }

      return message;
    } catch (error) {
      throw new Error(`Error getting latest message: ${error}`);
    }
  }

  async markAsDelivered(
    messageId: Types.ObjectId | string,
    deliveredAt: Date = new Date(),
  ): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(messageId, { deliveredAt }, { new: true });
    } catch (error) {
      throw new Error(`Error marking message as delivered: ${error}`);
    }
  }

  async markAsRead(messageId: Types.ObjectId | string, readAt: Date = new Date()): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(messageId, { isRead: true, readAt }, { new: true });
    } catch (error) {
      throw new Error(`Error marking message as read: ${error}`);
    }
  }

  async markMultipleAsRead(messageIds: string[], readAt: Date = new Date()): Promise<number> {
    try {
      const result = await MessageModel.updateMany(
        { _id: { $in: messageIds.map((id) => new Types.ObjectId(id)) } },
        { isRead: true, readAt },
      );
      return result.modifiedCount;
    } catch (error) {
      throw new Error(`Error marking multiple messages as read: ${error}`);
    }
  }

  async markChatMessagesAsRead(
    dto: { chatId: string; receiverRole: string; messageIds?: string[] }, 
    readAt: Date = new Date()
  ): Promise<number> {
    try {
      const matchCondition: any = {
        chatId: new Types.ObjectId(dto.chatId),
        senderRole: dto.receiverRole === 'User' ? 'Shop' : 'User',
        isRead: false,
      };

      if (dto.messageIds && dto.messageIds.length > 0) {
        matchCondition._id = { $in: dto.messageIds.map((id) => new Types.ObjectId(id)) };
      }

      const result = await MessageModel.updateMany(matchCondition, { isRead: true, readAt });
      return result.modifiedCount;
    } catch (error) {
      throw new Error(`Error marking chat messages as read: ${error}`);
    }
  }

  async addReaction(dto: { messageId: string; userId: string; emoji: string }): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(
        dto.messageId,
        {
          $push: {
            reactions: {
              userId: new Types.ObjectId(dto.userId),
              emoji: dto.emoji,
              reactedAt: new Date(),
            },
          },
        },
        { new: true },
      )
        .populate('reactions.userId', 'fullName profileImage');
    } catch (error) {
      throw new Error(`Error adding reaction: ${error}`);
    }
  }

  async removeReaction(messageId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<MessageDocument | null> {
    try {
      return await MessageModel.findByIdAndUpdate(
        messageId,
        { $pull: { reactions: { userId: new Types.ObjectId(userId) } } },
        { new: true },
      )
        .populate('reactions.userId', 'fullName profileImage');
    } catch (error) {
      throw new Error(`Error removing reaction: ${error}`);
    }
  }

  async searchMessages(
    chatId: Types.ObjectId | string,
    query: string,
    messageType?: 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
    page: number = 1,
    limit: number = 20,
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
        content: searchRegex,
        _id: { $exists: true },
        senderRole: { $exists: true },
        messageType: { $exists: true },
      };

      if (messageType) {
        matchCondition.messageType = messageType;
      }

      const [messages, total] = await Promise.all([
        MessageModel.find(matchCondition)
          .populate('reactions.userId', 'fullName profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments(matchCondition),
      ]);

      const validMessages = messages.filter((msg) => msg && msg._id);

      return {
        messages: validMessages,
        total,
        hasMore: skip + validMessages.length < total,
      };
    } catch (error) {
      throw new Error(`Error searching messages: ${error}`);
    }
  }

  async deleteMessage(messageId: Types.ObjectId | string): Promise<boolean> {
    try {
      const result = await MessageModel.findByIdAndDelete(messageId);
      return !!result;
    } catch (error) {
      throw new Error(`Error deleting message: ${error}`);
    }
  }

  async deleteChatMessages(chatId: Types.ObjectId | string): Promise<number> {
    try {
      const result = await MessageModel.deleteMany({
        chatId: new Types.ObjectId(chatId),
      });
      return result.deletedCount;
    } catch (error) {
      throw new Error(`Error deleting chat messages: ${error}`);
    }
  }

  async getMessagesByType(
    chatId: Types.ObjectId | string,
    messageType: 'Text' | 'Image' | 'Video' | 'Audio' | 'File',
    page: number = 1,
    limit: number = 20,
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
          messageType,
          _id: { $exists: true },
          senderRole: { $exists: true },
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments({
          chatId: new Types.ObjectId(chatId),
          messageType,
          _id: { $exists: true },
          senderRole: { $exists: true },
        }),
      ]);

      const validMessages = messages.filter((msg) => msg && msg._id);

      return {
        messages: validMessages,
        total,
        hasMore: skip + validMessages.length < total,
      };
    } catch (error) {
      throw new Error(`Error getting messages by type: ${error}`);
    }
  }

  async getChatMessageStats(chatId: Types.ObjectId | string): Promise<{
    totalMessages: number;
    textMessages: number;
    mediaMessages: number;
    unreadMessages: number;
    totalReactions: number;
  }> {
    try {
      const [stats] = await MessageModel.aggregate([
        {
          $match: {
            chatId: new Types.ObjectId(chatId),
            _id: { $exists: true },
            senderRole: { $exists: true },
            messageType: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            textMessages: { $sum: { $cond: [{ $eq: ['$messageType', 'Text'] }, 1, 0] } },
            mediaMessages: { $sum: { $cond: [{ $ne: ['$messageType', 'Text'] }, 1, 0] } },
            unreadMessages: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
            totalReactions: { $sum: { $size: '$reactions' } },
          },
        },
      ]);

      return (
        stats || {
          totalMessages: 0,
          textMessages: 0,
          mediaMessages: 0,
          unreadMessages: 0,
          totalReactions: 0,
        }
      );
    } catch (error) {
      throw new Error(`Error getting chat message stats: ${error}`);
    }
  }
}