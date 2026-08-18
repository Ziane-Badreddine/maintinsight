import { ForgotPasswordFrom } from "@/features/auth/components/forgot-password-form";
import React from "react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordFrom />
      </div>
    </div>
  );
}
