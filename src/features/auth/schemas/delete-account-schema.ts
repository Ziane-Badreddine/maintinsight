import { z } from "zod";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmation: z.literal("DELETE", {
    error: 'Type "DELETE" to confirm',
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const deleteAccountConfirmOnlySchema = z.object({
  confirmation: z.literal("DELETE", {
    error: 'Type "DELETE" to confirm',
  }),
});

export type DeleteAccountConfirmOnlyInput = z.infer<
  typeof deleteAccountConfirmOnlySchema
>;
