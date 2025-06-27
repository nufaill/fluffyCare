import { Schema, model } from 'mongoose';
import {  ShopDocument } from '../types/Shop.types';

const shopSchema = new Schema<ShopDocument>(
  {
    logo: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    streetAddress: { type: String, required: true },
    buildingNumber: { type: String },
    description: { type: String },
    certificateUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = model<ShopDocument>('Shop', shopSchema);
