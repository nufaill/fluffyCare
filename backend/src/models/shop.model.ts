import mongoose, { Schema, model } from 'mongoose';
import { ShopDocument } from '../types/Shop.types';

// Subschema: Shop Availability
const shopAvailabilitySchema = new Schema(
  {
    workingDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    openingTime: {
      type: String,
      default: '09:00',
      required: true,
    },
    closingTime: {
      type: String,
      default: '18:00',
      required: true,
    },
    lunchBreak: {
      start: { type: String, default: '13:00' },
      end: { type: String, default: '14:00' },
    },
    teaBreak: {
      start: { type: String, default: '' }, 
      end: { type: String, default: '' },
    },
    customHolidays: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
    timestamps: true,
  }
);


// Main Shop Schema
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

    shopAvailability: {
      type: shopAvailabilitySchema,
      default: () => ({}), // Will apply all defaults defined above
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
