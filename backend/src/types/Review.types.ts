import { Types } from "mongoose";

export interface IReview {
  _id?: Types.ObjectId;
  shopId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number; // 1 - 5 stars
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
