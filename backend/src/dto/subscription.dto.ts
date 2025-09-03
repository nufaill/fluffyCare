import { ISubscription } from '../types/subscription.type';
import { Types } from 'mongoose';

export class CreateSubscriptionDTO {
  plan: string;
  description: string;
  durationInDays:number;
  price: number;
  isActive: boolean;
  profitPercentage: number;

  constructor(data: Partial<ISubscription>) {
    this.plan = data.plan || '';
    this.description = data.description || '';
    this.durationInDays = data.durationInDays || 30;
    this.price = data.price || 0;
    this.isActive = data.isActive ?? true;
    this.profitPercentage = data.profitPercentage || 0;
  }
}

export class UpdateSubscriptionDTO {
  plan?: string;
  description?: string;
  durationInDays?: number;
  price?: number;
  isActive?: boolean;
  profitPercentage?: number;

  constructor(data: Partial<ISubscription>) {
    this.plan = data.plan;
    this.description = data.description;            
    this.durationInDays = data.durationInDays;            
    this.price = data.price;
    this.isActive = data.isActive;
    this.profitPercentage = data.profitPercentage;
  }
}

export class SubscriptionResponseDTO {
  _id: Types.ObjectId;
  plan: string;
  description: string;
  durationInDays: number;
  price: number;
  isActive: boolean;
  profitPercentage: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(subscription: ISubscription) {
    this._id = subscription._id;
    this.plan = subscription.plan;
    this.description = subscription.description;
    this.durationInDays = subscription.durationInDays;
    this.price = subscription.price;
    this.isActive = subscription.isActive;
    this.profitPercentage = subscription.profitPercentage;
    this.createdAt = subscription.createdAt;
    this.updatedAt = subscription.updatedAt;
  }
}