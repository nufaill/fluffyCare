// backend/src/types/user.types.ts

import { Document, ObjectId } from 'mongoose';

export interface CreateUserData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location?: Record<string, unknown>;
  isActive?: boolean;
  googleId?: string;
}

// This is the core shape of a user (without Mongoose wrappers)
export interface User {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  location?: Record<string, unknown>;
  isActive: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// This is what you get from Mongoose — including _id and Document methods
export interface UserDocument extends User, Document {
  _id: ObjectId;
}
