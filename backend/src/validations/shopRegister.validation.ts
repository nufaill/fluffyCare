// backend/src/validations/shop/register.validation.ts
import { z } from "zod";

export const shopRegisterSchema = z.object({
  body: z.object({
    logo: z.string().optional(),

    name: z.string().min(2, "Shop name must be at least 2 characters"),

    email: z.string().email("Invalid email address"),

    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone number must contain only digits"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),

    city: z.string().min(2, "City is required"),

    streetAddress: z.string().min(2, "Street address is required"),

    description: z.string().optional(),

    certificateUrl: z.string().url("Certificate URL must be valid"),

    location: z
      .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),
  }),
});
