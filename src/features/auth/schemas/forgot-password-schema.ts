import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
