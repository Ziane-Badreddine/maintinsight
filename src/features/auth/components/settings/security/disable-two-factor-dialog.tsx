// features/auth/components/settings/security/disable-two-factor-dialog.tsx
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

import { useDisableTwoFactor } from "../../../hooks/use-two-factor";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

interface DisableTwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisableTwoFactorDialog({
  open,
  onOpenChange,
}: DisableTwoFactorDialogProps) {
  const disableTwoFactor = useDisableTwoFactor();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (!open) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await disableTwoFactor.mutateAsync(values.password);
      onOpenChange(false);
    } catch (error) {
      form.setError("password", {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication</DialogTitle>
          <DialogDescription>
            Confirm your password to turn off 2FA. You&apos;ll lose the extra
            protection it provides.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} id="disable-2fa-form">
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="disable-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="disable-password"
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
            form="disable-2fa-form"
            variant="destructive"
            disabled={disableTwoFactor.isPending}
          >
            {disableTwoFactor.isPending && <Spinner />}
            Disable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
