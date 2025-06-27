// backend/src/validations/google-auth.validation.ts
import z from 'zod';

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential cannot be empty')
});
