// src/app/(public)/goodbye/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account deleted",
  description: "Your MaintInsight account has been permanently deleted.",
  robots: { index: false, follow: false },
};
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GoodbyePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <CheckCircle2 className="size-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Account deleted</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your account and all associated data have been permanently removed.
          We&apos;re sorry to see you go.
        </p>
      </div>

      <Button render={<Link href="/">Back to home</Link>}></Button>
    </div>
  );
}
