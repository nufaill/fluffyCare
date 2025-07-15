// auth.dto.ts
import { CreateUserData } from '../types/User.types';

export interface RegisterUserDTO {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export type CreateUserDTO = CreateUserData; 

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
}

export interface ResendOtpDTO {
  email: string;
}

export interface GoogleAuthDTO {
  credential: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface SendResetLinkDTO {
  email: string;
}