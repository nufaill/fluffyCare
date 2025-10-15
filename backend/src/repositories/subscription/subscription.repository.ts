import { Model, Types, FilterQuery } from "mongoose";
import { ISubscription } from "../../types/subscription.type";
import { SubscriptionModel } from "../../models/subscription.model";
import { ISubscriptionRepository } from './../../interfaces/repositoryInterfaces/ISubscriptionRepository';

interface SubscriptionPaginatedResult {
  subscriptions: ISubscription[];
  total: number;
  page: number;
  limit: number;
}

export class SubscriptionRepository implements ISubscriptionRepository {
  private readonly _subscriptionModel: Model<ISubscription>;

  constructor() {
    this._subscriptionModel = SubscriptionModel;
  }

  async findByPlanName(plan: string): Promise<ISubscription | null> {
    return await this._subscriptionModel.findOne({ plan }).exec();
  }

  async createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    const subscriptionToCreate = {
      ...subscriptionData,
      isActive: subscriptionData.isActive !== undefined ? subscriptionData.isActive : true,
    };

    const subscription = await this._subscriptionModel.create(subscriptionToCreate);
    return subscription;
  }

  async updateSubscription(subscriptionId: Types.ObjectId, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
    const updatedSubscription = await this._subscriptionModel
      .findByIdAndUpdate(subscriptionId, { $set: updateData }, { new: true, runValidators: true })
      .exec();

    if (!updatedSubscription) {
      throw new Error("Subscription not found");
    }

    return updatedSubscription;
  }

  async getAllSubscriptions(filter: FilterQuery<ISubscription>, page: number, limit: number): Promise<SubscriptionPaginatedResult> {
    const query = filter || {};

    const [subscriptions, total] = await Promise.all([
      this._subscriptionModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this._subscriptionModel.countDocuments(query).exec(),
    ]);

    return {
      subscriptions,
      total,
      page,
      limit,
    };
  }
}