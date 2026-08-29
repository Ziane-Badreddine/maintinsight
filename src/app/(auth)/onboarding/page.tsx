import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Complete your MaintInsight profile.",
  robots: { index: false, follow: false },
};

import { OnboardingForm } from "@/features/auth/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OnboardingForm />
      </div>
    </div>
  );
}
