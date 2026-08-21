"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";

interface CompleteOnboardingInput {
  name: string;
  password: string;
}

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const requestHeaders = await headers();

  try {
    await auth.api.updateUser({
      body: { name: input.name },
      headers: requestHeaders,
    });

    await auth.api.setPassword({
      body: { newPassword: input.password },
      headers: requestHeaders,
    });

    return { success: true };
  } catch (error) {
    if (
      error instanceof APIError &&
      error.body?.code === "PASSWORD_ALREADY_SET"
    ) {
      return { success: true };
    }

    console.error("Failed to complete onboarding:", error);

    const message =
      error instanceof APIError
        ? (error.body?.message ?? "Please try again.")
        : "Please try again.";

    return { success: false, error: message };
  }
}
