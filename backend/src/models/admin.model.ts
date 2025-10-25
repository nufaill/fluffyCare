import { Schema, model, Document, ObjectId } from 'mongoose';
import { AdminDocument } from  '../types/admin.types';

const adminSchema = new Schema<AdminDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique:  true },
    password: { type: String }
  },
  { timestamps: true }
);

export const Admin = model<AdminDocument>('Admin', adminSchema);

export { AdminDocument };
