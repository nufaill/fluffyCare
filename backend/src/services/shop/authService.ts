// backend/src/services/shop/authService.ts
import bcrypt from 'bcrypt';
import { ShopRepository } from '../../repositories/shopRepository';
import { JwtService } from '../jwt/jwtService';
import { CreateShopData } from '../../types/Shop.types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../shared/constant';
import { CustomError } from "../../util/CustomerError";
import { generateOtp, sendOtpEmail } from 'util/sendOtp';
import { OtpRepository } from 'repositories/otpRepository';
import crypto from 'crypto';
import { config } from '../../config/env';
import { EmailService } from '../emailService/emailService';
import PASSWORD_RESET_MAIL_CONTENT from 'shared/mailTemplate';

export interface LoginData{
    email:string;
    password:string;
}

export interface ShopLocation {
  lat: number;
  lng: number;
}

export interface RegisterShopData {
  logo?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  streetAddress: string;
  buildingNumber: string;
  description: string;
  certificateUrl: string;
  location: ShopLocation;
}