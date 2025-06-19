// backend/src/validations/google-auth.validation.ts
import { z } from 'zod';

export const googleAuthSchema = z.object({
  idToken: z
    .string({ required_error: 'Google ID token is required' })
    .min(1, 'Google ID token cannot be empty'),
});

export type GoogleAuthSchema = z.infer<typeof googleAuthSchema>;