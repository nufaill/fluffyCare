import { Schema, model, Document } from 'mongoose';
import { CreateUserDTO } from '../dtos/auth.dto';

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  userData: CreateUserDTO;
  expiresAt: Date;
  attempts: number;
}

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
    type: Schema.Types.Mixed, // Store CreateUserDTO as mixed type
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const OtpModel = model<IOtp>('Otp', otpSchema);