import { z } from 'zod';

export const phoneSchema = z
  .string({ required_error: 'Phone is required' })
  .regex(/^[6-9]\d{9}$/, 'Invalid phone number');
