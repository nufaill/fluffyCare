import { z } from 'zod';

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Invalid email format');