import { z } from 'zod';

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(5, 'Password must be at least 5 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    'Password must include upper, lower, number & symbol'
  );