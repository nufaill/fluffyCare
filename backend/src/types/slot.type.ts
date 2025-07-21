import { Types } from 'mongoose';

export interface Slot {
  _id?: Types.ObjectId;
  shopId: Types.ObjectId;
  slotDate: Date;
  startTime: string; //store "HH:mm" format
  endTime: string;
  isBooked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
