// features/auth/components/settings/security/regenerate-backup-codes-dialog.tsx
"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

interface RegenerateBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerated: (backupCodes: string[]) => void;
}

export function RegenerateBackupCodesDialog({
  open,
  onOpenChange,
  onRegenerated,
}: RegenerateBackupCodesDialogProps) {
  const regenerate = useRegenerateBackupCodes();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (!open) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: z.infer<typeof schema>) {
    await regenerate.mutateAsync(values.password, {
      onSuccess: (data) => {
        onRegenerated(data?.backupCodes ?? []);
        onOpenChange(false);
      },
      onError: (error) => {
        form.setError("password", {
          message:
            error instanceof Error ? error.message : "Something went wrong",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate backup codes</DialogTitle>
          <DialogDescription>
            Confirm your password. Your existing backup codes will stop working
            once new ones are generated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="regenerate-codes-form">
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
      </DialogContent>
    </Dialog>
  );
}
