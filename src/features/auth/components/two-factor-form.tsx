// features/auth/components/two-factor-form.tsx
"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import { parseAsString, useQueryState } from "nuqs";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { KeyRound, ShieldCheck } from "lucide-react";
import Logo from "@/assets/logo.svg";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

import { useVerifyTwoFactor } from "../hooks/use-verify-two-factor";

export function TwoFactorForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [redirect] = useQueryState("redirect", parseAsString);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const { form, onSubmit, isSubmitting } = useVerifyTwoFactor(redirect);

  function toggleBackupCode() {
    form.setValue("code", "");
    form.clearErrors("code");
    setUseBackupCode((v) => !v);
  }

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(values, useBackupCode))}
      id="two-factor-form"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <Logo className="size-8" title="maintinsight" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </Link>
          <h1 className="text-xl font-bold">Two-factor authentication</h1>
          <FieldDescription>
            {useBackupCode
              ? "Enter one of your backup codes."
              : "Enter the 6-digit code from your authenticator app."}
          </FieldDescription>
        </div>

        {useBackupCode ? (
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="code">Backup code</FieldLabel>
                <Input
                  {...field}
                  id="code"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                  placeholder="xkKLY-PnBvB"
                  className="bg-background font-mono"
                  autoComplete="one-time-code"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ) : (
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="items-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  id="code"
                  autoFocus
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onComplete={form.handleSubmit((values) =>
                    onSubmit(values, false),
                  )}
                  disabled={isSubmitting}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {fieldState.invalid && (
                  <FieldError
                    className="text-center"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        )}

        {useBackupCode && (
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Verify
            </Button>
          </Field>
        )}

        <Button
          type="button"
          variant="outline"
          className="text-muted-foreground"
          onClick={toggleBackupCode}
        >
          {useBackupCode ? (
            <>
              <ShieldCheck className="size-4" />
              Use authenticator code instead
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              Use a backup code instead
            </>
          )}
        </Button>
      </FieldGroup>
      <FieldDescription className="px-6 text-center">
        Lost access to both? <a href="#">Contact support</a>.
      </FieldDescription>
    </form>
  );
}
