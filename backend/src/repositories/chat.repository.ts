import { Types } from "mongoose";
import { ChatModel } from "../models/chat.model";
import { Chat, ChatDocument } from "../types/Chat.types";
import { IChatRepository } from '../interfaces/repositoryInterfaces/IChatRepository';

export class ChatRepository implements IChatRepository {
  async createChat(chatData: Partial<Chat>): Promise<ChatDocument> {
    try {
      const chat = new ChatModel(chatData);
      return await chat.save();
    } catch (error) {
      throw new Error(`Error creating chat: ${error}`);
    }
  }
  async findChatByUserAndShop(
    userId: Types.ObjectId | string,
    shopId: Types.ObjectId | string
  ): Promise<ChatDocument | null> {
    try {
      return await ChatModel.findOne({
        userId: new Types.ObjectId(userId),
        shopId: new Types.ObjectId(shopId),
      })
        .populate("userId", "fullName email profileImage phone")
        .populate("shopId", "name email logo phone city")
        .lean();
    } catch (error) {
      throw new Error(`Error finding chat: ${error}`);
    }
  }
  async findChatById(chatId: Types.ObjectId | string): Promise<ChatDocument | null> {
    try {
      return await ChatModel.findById(chatId)
        .populate("userId", "fullName email profileImage phone")
        .populate("shopId", "name email logo phone city")
        .lean();
    } catch (error) {
      throw new Error(`Error finding chat by ID: ${error}`);
    }
  }
  async getUserChats(
    userId: Types.ObjectId | string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    chats: ChatDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [chats, total] = await Promise.all([
        ChatModel.find({ userId: new Types.ObjectId(userId) })
          .populate("userId", "fullName email profileImage phone")
          .populate("shopId", "name email logo phone city")
          .sort({ lastMessageAt: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ChatModel.countDocuments({ userId: new Types.ObjectId(userId) })
      ]);

      return {
        chats,
        total,
        hasMore: skip + chats.length < total
      };
    } catch (error) {
      throw new Error(`Error getting user chats: ${error}`);
    }
  }
  async getShopChats(
    shopId: Types.ObjectId | string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    chats: ChatDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [chats, total] = await Promise.all([
        ChatModel.find({ shopId: new Types.ObjectId(shopId) })
          .populate("userId", "fullName email profileImage phone")
          .populate("shopId", "name email logo phone city")
          .sort({ lastMessageAt: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ChatModel.countDocuments({ shopId: new Types.ObjectId(shopId) })
      ]);

      return {
        chats,
        total,
        hasMore: skip + chats.length < total
      };
    } catch (error) {
      throw new Error(`Error getting shop chats: ${error}`);
    }
  }
  async updateLastMessage(
    chatId: Types.ObjectId | string,
    updateData: {
      lastMessage: string;
      lastMessageType: "Text" | "Image" | "Video" | "Audio" | "File";
      lastMessageAt: Date;
    }
  ): Promise<ChatDocument | null> {
    try {
      return await ChatModel.findByIdAndUpdate(
        chatId,
        {
          ...updateData,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
        .populate("userId", "fullName email profileImage phone")
        .populate("shopId", "name email logo phone city");
    } catch (error) {
      throw new Error(`Error updating last message: ${error}`);
    }
  }
  async incrementUnreadCount(chatId: Types.ObjectId | string): Promise<ChatDocument | null> {
    try {
      return await ChatModel.findByIdAndUpdate(
        chatId,
        { $inc: { unreadCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error incrementing unread count: ${error}`);
    }
  }
  async resetUnreadCount(chatId: Types.ObjectId | string): Promise<ChatDocument | null> {
    try {
      return await ChatModel.findByIdAndUpdate(
        chatId,
        { unreadCount: 0 },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error resetting unread count: ${error}`);
    }
  }
  async deleteChat(chatId: Types.ObjectId | string): Promise<boolean> {
    try {
      const result = await ChatModel.findByIdAndDelete(chatId);
      return !!result;
    } catch (error) {
      throw new Error(`Error deleting chat: ${error}`);
    }
  }
  async getOrCreateChat(
    userId: Types.ObjectId | string,
    shopId: Types.ObjectId | string
  ): Promise<ChatDocument> {
    try {
      let chat = await this.findChatByUserAndShop(userId, shopId);
      
      if (!chat) {
        chat = await this.createChat({
          userId: new Types.ObjectId(userId),
          shopId: new Types.ObjectId(shopId),
          lastMessage: "",
          lastMessageType: "Text",
          lastMessageAt: null,
          unreadCount: 0,
        });
      }
      
      return chat;
    } catch (error) {
      throw new Error(`Error getting or creating chat: ${error}`);
    }
  }
  async searchChats(
    searcherId: Types.ObjectId | string,
    searcherRole: "User" | "Shop",
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    chats: ChatDocument[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(query, 'i');
      
      let matchCondition: any = {};
      let lookupStage: any = {};
      let searchCondition: any = {};

      if (searcherRole === "User") {
        matchCondition = { userId: new Types.ObjectId(searcherId) };
        lookupStage = {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'shop'
        };
        searchCondition = {
          $or: [
            { 'shop.name': searchRegex },
            { 'shop.email': searchRegex }
          ]
        };
      } else {
        matchCondition = { shopId: new Types.ObjectId(searcherId) };
        lookupStage = {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        };
        searchCondition = {
          $or: [
            { 'user.fullName': searchRegex },
            { 'user.email': searchRegex }
          ]
        };
      }

      const pipeline = [
        { $match: matchCondition },
        { $lookup: lookupStage },
        { $match: searchCondition },
        { $sort: { lastMessageAt: -1 as -1, updatedAt: -1 as -1 } },
        {
          $facet: {
            chats: [
              { $skip: skip },
              { $limit: limit }
            ],
            totalCount: [
              { $count: "total" }
            ]
          }
        }
      ];

      const result = await ChatModel.aggregate(pipeline);
      const chats = result[0]?.chats || [];
      const total = result[0]?.totalCount[0]?.total || 0;

      return {
        chats,
        total,
        hasMore: skip + chats.length < total
      };
    } catch (error) {
      throw new Error(`Error searching chats: ${error}`);
    }
  }
  async getTotalUnreadCount(
    userId: Types.ObjectId | string,
    role: "User" | "Shop"
  ): Promise<number> {
    try {
      const matchCondition = role === "User" 
        ? { userId: new Types.ObjectId(userId) }
        : { shopId: new Types.ObjectId(userId) };

      const result = await ChatModel.aggregate([
        { $match: matchCondition },
        { $group: { _id: null, totalUnread: { $sum: "$unreadCount" } } }
      ]);

      return result[0]?.totalUnread || 0;
    } catch (error) {
      throw new Error(`Error getting total unread count: ${error}`);
    }
  }
}