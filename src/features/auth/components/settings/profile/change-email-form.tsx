"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const changeEmailSchema = z.object({
  newEmail: z.email("Enter a valid email address"),
});

type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

interface ChangeEmailFormProps {
  currentEmail: string;
  onDone: () => void;
}

export function ChangeEmailForm({
  currentEmail,
  onDone,
}: ChangeEmailFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "" },
  });

  async function onSubmit(values: ChangeEmailInput) {
    if (values.newEmail === currentEmail) {
      setServerError("This is already your current email address.");
      return;
    }

    setIsPending(true);
    setServerError(null);

    const { error } = await authClient.changeEmail({
      newEmail: values.newEmail,
      callbackURL: "/dashboard",
    });

    setIsPending(false);

    if (error) {
      setServerError(error.message ?? "Something went wrong.");
      return;
    }

    setSentTo(values.newEmail);
  }

  if (sentTo) {
    return (
      <div className="flex items-start gap-3 rounded border p-4">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="space-y-2">
          <p className="text-sm">
            A verification link was sent to <strong>{sentTo}</strong>. Your
            email will update once you confirm it.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onDone}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 border p-4 rounded"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.newEmail}>
          <FieldLabel htmlFor="new-email">New email address</FieldLabel>
          <Input
            id="new-email"
            type="email"
            placeholder="you@example.com"
            autoFocus
            {...register("newEmail")}
          />
          <FieldError errors={[errors.newEmail]} />
        </Field>
      </FieldGroup>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
          Send verification
        </Button>
      </div>
    </form>
  );
}
