import mongoose, { Schema } from 'mongoose';
import { Slot } from '../types/slot.type';

const SlotSchema: Schema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, required: true, ref: 'Shop' },
    slotDate: { type: String, required: true },

    shopOpenTime: { type: String, required: true },
    shopCloseTime: { type: String, required: true },

    lunchStartTime: { type: String },
    lunchEndTime: { type: String },

    staffId: { type: String, required: true },
    staffName: { type: String },
    staffCount: { type: Number, required: true },

    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationInMinutes: { type: Number, required: true },

    isBooked: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
    isHoliday: { type: Boolean, default: false },
    holidayReason: { type: String },
    isWeekendHoliday: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.model<Slot>('Slot', SlotSchema)