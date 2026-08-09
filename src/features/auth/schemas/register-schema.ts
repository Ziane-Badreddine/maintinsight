import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.email("Please enter a valid email address").trim().toLowerCase(),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
