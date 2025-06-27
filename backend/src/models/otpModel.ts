import mongoose, { Schema } from 'mongoose';
import { IOtp } from '../types/otp'

const otpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  userData: {
    type: Schema.Types.Mixed, 
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1 });

export const OtpModel = mongoose.model<IOtp>('Otp', otpSchema);
