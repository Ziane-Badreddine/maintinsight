// features/auth/components/settings/danger/delete-account-dialog.tsx
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  DeleteAccountInput,
  deleteAccountSchema,
} from "@/features/auth/schemas/delete-account-schema";

export function DeleteAccountDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "", confirmation: undefined },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: DeleteAccountInput) {
    setServerError(null);

    const { error } = await authClient.deleteUser({
      password: values.password,
      callbackURL: "/goodbye",
    });

    if (error) {
      setServerError(error.message ?? "Something went wrong.");
      return;
    }

    router.push("/goodbye");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      setServerError(null);
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Confirm your password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    This step helps prevent accidental deletion.
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
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              )}
              Delete my account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
