import { z } from 'zod';
import { nameSchema } from './name.validation';
import { emailSchema } from './email.validation';
import { phoneSchema } from './phone.validation';
import { passwordSchema } from './password.validation';

export const registerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  profileImage: z.string().optional(),
  location: z.record(z.any()).optional(),
  isActive: z.boolean().optional()
});

export type RegisterSchema = z.infer<typeof registerSchema>;