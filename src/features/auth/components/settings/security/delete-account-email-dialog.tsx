// features/auth/components/settings/danger/delete-account-email-dialog.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DeleteAccountConfirmOnlyInput,
  deleteAccountConfirmOnlySchema,
} from "@/features/auth/schemas/delete-account-schema";

export function DeleteAccountEmailDialog() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<DeleteAccountConfirmOnlyInput>({
    resolver: zodResolver(deleteAccountConfirmOnlySchema),
    defaultValues: { confirmation: undefined },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit() {
    setServerError(null);

    const { error } = await authClient.deleteUser({
      callbackURL: "/goodbye",
    });

    if (error) {
      setServerError(error.message ?? "Something went wrong.");
      return;
    }

    setSent(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      setServerError(null);
      setSent(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            Delete account
          </Button>
        }
      ></DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This will permanently delete your account and all associated data.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm">
              We sent a confirmation link to your email. Click it to permanently
              delete your account.
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Controller
                name="confirmation"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Type <strong>DELETE</strong> to confirm
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="DELETE"
                      autoFocus
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      We&apos;ll email you a link to confirm the deletion.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                )}
                Send confirmation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
