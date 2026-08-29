import { ForgotPasswordFrom } from "@/features/auth/components/forgot-password-form";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure MaintInsight password reset link.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordFrom />
      </div>
    </div>
  );
}
