// features/auth/components/settings/security/enable-two-factor-dialog.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy, Download, Eye, EyeOff } from "lucide-react";
import QRCode from "react-qr-code";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  useEnableTwoFactor,
  useVerifyTotp,
} from "../../../hooks/use-two-factor";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const codeSchema = z.object({
  code: z.string().length(6, "Enter the 6-digit code"),
});

type Step = "password" | "scan" | "verify" | "backup-codes";

function extractSecret(totpURI: string) {
  try {
    return new URL(totpURI).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

interface EnableTwoFactorDialogProps {
  onEnabled: (backupCodes: string[]) => void;
}

export function EnableTwoFactorDialog({
  onEnabled,
}: EnableTwoFactorDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("password");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);

  const enableTwoFactor = useEnableTwoFactor();
  const verifyTotp = useVerifyTotp();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const secret = extractSecret(totpURI);

  function reset() {
    setStep("password");
    setTotpURI("");
    setBackupCodes([]);
    setCopiedSecret(false);
    setCopiedBackupCodes(false);
    passwordForm.reset();
    codeForm.reset();
  }

  function onOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  async function onSubmitPassword(values: z.infer<typeof passwordSchema>) {
    await enableTwoFactor.mutateAsync(values.password, {
      onSuccess: (data) => {
        setTotpURI(data?.totpURI ?? "");
        setBackupCodes(data?.backupCodes ?? []);
        setStep("scan");
      },
      onError: (error) => {
        passwordForm.setError("password", {
          message:
            error instanceof Error ? error.message : "Something went wrong",
        });
      },
    });
  }

  async function onSubmitCode(values: z.infer<typeof codeSchema>) {
    await verifyTotp.mutateAsync(values.code, {
      onSuccess: () => {
        setStep("backup-codes");
      },
      onError: (error) => {
        codeForm.setError("code", {
          message: error instanceof Error ? error.message : "Invalid code",
        });
      },
    });
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  function finish() {
    onEnabled(backupCodes);
    onOpenChange(false);
  }

  function copyBackupCodes() {
    if (!backupCodes.length) return;

    navigator.clipboard.writeText(backupCodes.join("\n"));

    setCopiedBackupCodes(true);

    setTimeout(() => {
      setCopiedBackupCodes(false);
    }, 2000);
  }

  function downloadBackupCodes() {
    if (!backupCodes.length) return;

    const blob = new Blob([backupCodes.join("\n")], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button>Enable</Button>}></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "password" && (
          <>
            <DialogHeader>
              <DialogTitle>Enable two-factor authentication</DialogTitle>
              <DialogDescription>
                Confirm your password to continue.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              id="enable-2fa-password-form"
            >
              <FieldGroup>
                <Controller
                  name="password"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id="password"
                          aria-invalid={fieldState.invalid}
                          type={isPasswordHidden ? "password" : "text"}
                          autoComplete="current-password webauthn"
                          className="bg-background"
                          placeholder="password"
                        />
                        <InputGroupAddon align={"inline-end"}>
                          <InputGroupButton
                            size="icon-xs"
                            onClick={() => {
                              setIsPasswordHidden(!isPasswordHidden);
                            }}
                          >
                            {isPasswordHidden ? <Eye /> : <EyeOff />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
            <DialogFooter>
              <Button
                type="submit"
                form="enable-2fa-password-form"
                disabled={enableTwoFactor.isPending}
              >
                {enableTwoFactor.isPending && <Spinner />}
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "scan" && (
          <>
            <DialogHeader>
              <DialogTitle>Scan the QR code</DialogTitle>
              <DialogDescription>
                Scan this with your authenticator app. On the same device? Enter
                the code manually instead.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center rounded-lg border p-4">
              <QRCode value={totpURI} size={180} />
            </div>
            <Field>
              <FieldLabel htmlFor="secret">
                Can&apos;t scan? Enter this code
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  readOnly
                  value={secret}
                  className="font-mono"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={copySecret}
                >
                  {copiedSecret ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </Field>
            <DialogFooter>
              <Button onClick={() => setStep("verify")}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle>Enter verification code</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code generated by your authenticator app.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={codeForm.handleSubmit(onSubmitCode)}
              id="enable-2fa-verify-form"
            >
              <FieldGroup>
                <Controller
                  name="code"
                  control={codeForm.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="items-center"
                    >
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        id="code"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        onComplete={codeForm.handleSubmit(onSubmitCode)}
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
              </FieldGroup>
            </form>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("scan")}
              >
                Back
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "backup-codes" && (
          <>
            <DialogHeader>
              <DialogTitle>Save your backup codes</DialogTitle>

              <DialogDescription>
                Store these somewhere safe. Each code can be used once to sign
                in if you lose access to your authenticator app.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                {backupCodes.map((code) => (
                  <span key={code}>{code}</span>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyBackupCodes}
                >
                  {copiedBackupCodes ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}

                  {copiedBackupCodes ? "Copied" : "Copy"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={downloadBackupCodes}
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={finish}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
