import { Document } from 'mongoose';

export interface IUserData {
  userId: string;
  role: 'user' | 'shop'; 
  name?: string; 
  [key: string]: unknown; 
}

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  userData: IUserData;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}
