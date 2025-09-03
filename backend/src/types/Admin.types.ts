import { Types, Document as MongooseDocument, ObjectId } from 'mongoose';

export interface CreateAdminData {
  fullName: string;
  email: string;
  password?: string;
}

export interface Admin {
  fullName: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface AuthResponse {
  admin: {
    _id: string;
    fullName: string;
    email: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
export interface AdminDocument extends Admin, MongooseDocument {
  _id: Types.ObjectId;
}