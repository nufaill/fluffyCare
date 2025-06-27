// backend/src/validations/otp.zod.ts
import { z } from 'zod';

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  otp: z.string()
    .regex(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
});

export const resendOtpSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' })
});
