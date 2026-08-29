import { Alert, AlertTitle } from "@/components/ui/alert";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new MaintInsight account password.",
  robots: { index: false, follow: false },
};
import { Button } from "@/components/ui/button";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";
import { AlertCircle, ChevronLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { createSearchParamsCache, parseAsString } from "nuqs/server";

const searchParamsCache = createSearchParamsCache({
  token: parseAsString,
  error: parseAsString,
});

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token, error } = await searchParamsCache.parse(searchParams);

  if (error === "INVALID_TOKEN") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <KeyRound className="size-10" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-center text-lg font-semibold md:text-xl">
              Invalid reset link
            </h1>

            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired. Please request
              a new password reset link.
            </p>
          </div>

          <Alert className="w-full bg-destructive/50 text-left">
            <AlertCircle />
            <AlertTitle className="text-muted-foreground">
              The password reset link is no longer valid.
            </AlertTitle>
          </Alert>

          <Link href="/forgot-password" className="w-full">
            <Button className="w-full">
              <ChevronLeft />
              Request a new link
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="link"
              className="text-muted-foreground hover:text-foreground"
            >
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Invalid password reset link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
