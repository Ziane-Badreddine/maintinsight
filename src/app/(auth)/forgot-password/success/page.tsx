import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, ChevronLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function ForgotPasswordSuccessPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center gap-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <MailCheck className="size-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-lg md:text-xl text-center">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm">
            You&apos;ll receive an email if an account associated with the email
            address exists
          </p>
        </div>
        <Alert className="w-full">
          <CheckCircle2Icon />
          <AlertTitle>
            If you don&apos;t see the email, check your spam folder.
          </AlertTitle>
        </Alert>
        <Link href="/forgot-password" className="w-full">
          <Button className="w-full">
            <ChevronLeft />
            Back to reset password{" "}
          </Button>
        </Link>

        <Link href="/login">
          <Button
            variant={"link"}
            className={"text-muted-foreground hover:text-foreground"}
          >
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  );
}
