import { Schema, model, Document, ObjectId } from 'mongoose';
import { UserDocument } from '../types/User.types';

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profileImage: { type: String, default: '' },
    phone: { type: String },
    location: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
    googleId: { type: String },
   resetPasswordToken: { type: String },
   resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export const User = model<UserDocument>('User', userSchema);


