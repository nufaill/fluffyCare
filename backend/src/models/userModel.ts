import { Schema, model } from 'mongoose';
import { UserDocument } from '../types/User.types';

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: { type: String, default: '' },
    phone: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    isActive: { type: Boolean, default: true },
    googleId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

//2dsphere index
userSchema.index({ location: '2dsphere' });

export const User = model<UserDocument>('User', userSchema);
