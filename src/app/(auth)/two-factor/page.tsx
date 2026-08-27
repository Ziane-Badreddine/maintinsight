"use client";

import { TwoFactorForm } from "@/features/auth/components/two-factor-form";

export default function TwoFactorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <TwoFactorForm />
      </div>
    </div>
  );
}
