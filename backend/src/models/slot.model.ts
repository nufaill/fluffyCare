import mongoose, { Schema } from 'mongoose';
import { Slot } from '../types/slot.type';

const slotSchema = new Schema<Slot>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    slotDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

export const SlotModel = mongoose.model<Slot>('Slot', slotSchema);
