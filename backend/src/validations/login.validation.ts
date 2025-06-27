import { z } from 'zod';
import { emailSchema } from './email.validation';
import { passwordSchema } from './password.validation';

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export type LoginSchema = z.infer<typeof loginSchema>;