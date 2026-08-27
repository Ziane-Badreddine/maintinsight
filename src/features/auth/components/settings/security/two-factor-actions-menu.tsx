/* eslint-disable react-hooks/set-state-in-effect */
// features/auth/components/settings/security/two-factor-actions-menu.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, RotateCw, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DisableTwoFactorDialog } from "./disable-two-factor-dialog";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { useRegenerateBackupCodes } from "../../../hooks/use-two-factor";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

type Step = "password" | "codes";

interface RegenerateBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorActionsMenu() {
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  // Close the dropdown before opening a dialog, or Radix's focus
  // trap on the dropdown fights with the dialog's.
  function openRegenerate() {
    setTimeout(() => setRegenerateOpen(true), 0);
  }
  function openRemove() {
    setTimeout(() => setRemoveOpen(true), 0);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant={"ghost"}>
              <MoreHorizontal className="size-4" />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              openRegenerate();
            }}
          >
            <RotateCw className="size-4" />
            Regenerate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              openRemove();
            }}
          >
            <ShieldX className="size-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RegenerateBackupCodesDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
      />
      <DisableTwoFactorDialog open={removeOpen} onOpenChange={setRemoveOpen} />
    </>
  );
}

export function RegenerateBackupCodesDialog({
  open,
  onOpenChange,
}: RegenerateBackupCodesDialogProps) {
  const [step, setStep] = useState<Step>("password");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const regenerate = useRegenerateBackupCodes();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  // Reset local state whenever the dialog is closed, however it closes.
  useEffect(() => {
    if (!open) {
      setStep("password");
      setBackupCodes([]);
      setCopied(false);
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: z.infer<typeof schema>) {
    await regenerate.mutateAsync(values.password, {
      onSuccess: (data) => {
        setBackupCodes(data?.backupCodes ?? []);
        setStep("codes");
      },
      onError: (error) => {
        form.setError("password", {
          message:
            error instanceof Error ? error.message : "Something went wrong",
        });
      },
    });
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadBackupCodes() {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "password" && (
          <>
            <DialogHeader>
              <DialogTitle>Regenerate backup codes</DialogTitle>
              <DialogDescription>
                Confirm your password. Your existing backup codes will stop
                working once new ones are generated.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="regenerate-codes-form"
            >
              <FieldGroup>
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="regen-password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="regen-password"
                        type="password"
                        autoFocus
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                      />
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
                form="regenerate-codes-form"
                disabled={regenerate.isPending}
              >
                {regenerate.isPending && <Spinner />}
                Regenerate
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "codes" && (
          <>
            <DialogHeader>
              <DialogTitle>Save your new backup codes</DialogTitle>
              <DialogDescription>
                Your old backup codes no longer work. Store these somewhere
                safe.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm">
              {backupCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyBackupCodes}>
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  Copy
                </Button>
                <Button variant="outline" onClick={downloadBackupCodes}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
