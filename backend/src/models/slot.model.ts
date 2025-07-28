import mongoose, { Schema } from 'mongoose';
import { Slot } from '../types/slot.type';

const SlotSchema: Schema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
    staffId: { type: Schema.Types.ObjectId, required: true, ref: 'Staff' },
    slotDate: { type: String, required: true },
    durationInMinutes: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isCancelled: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<Slot>('Slot', SlotSchema);