import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Two-factor authentication",
  description: "Verify your MaintInsight account.",
  robots: { index: false, follow: false },
};

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
