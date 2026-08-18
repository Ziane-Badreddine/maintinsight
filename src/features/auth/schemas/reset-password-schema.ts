import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
