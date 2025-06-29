import { Types,Document, ObjectId } from 'mongoose';

export interface CreateAdminData {
  fullName: string;
  email: string;
  password: string;
}

export interface Admin {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminDocument extends Admin, Document {
  _id: Types.ObjectId;
}