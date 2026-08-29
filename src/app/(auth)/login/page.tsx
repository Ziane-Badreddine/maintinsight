import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your MaintInsight dashboard.",
  robots: { index: false, follow: false },
};

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
