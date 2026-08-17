"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export interface SetPasswordState {
  error?: string;
  success?: boolean;
}

export async function setPassword(
  _previousState: SetPasswordState | undefined,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = setPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await auth.api.setPassword({
      body: { newPassword: parsed.data.newPassword },
      headers: await headers(),
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Something went wrong",
    };
  }

  return { success: true };
}
