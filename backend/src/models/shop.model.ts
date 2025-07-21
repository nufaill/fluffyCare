import { Schema, model } from 'mongoose';
import { ShopDocument } from '../types/Shop.types';

const shopSchema = new Schema<ShopDocument>(
  {
    logo: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    streetAddress: { type: String, required: true },
    description: { type: String },
    certificateUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    staffCount: { type: Number, default: 1 },
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

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

shopSchema.index({ location: '2dsphere' });

export const Shop = model<ShopDocument>('Shop', shopSchema);
