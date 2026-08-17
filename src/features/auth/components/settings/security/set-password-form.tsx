"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  setPassword,
  type SetPasswordState,
} from "@/features/auth/actions/set-password";

interface SetPasswordFormProps {
  email: string;
  onDone: () => void;
}

const initialState: SetPasswordState = {};

export function SetPasswordForm({ email, onDone }: SetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    setPassword,
    initialState,
  );

  if (state.success) {
    onDone();
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        You signed up with a social account and don&apos;t have a password yet.
        Set one below so you can also sign in with <strong>{email}</strong>.
      </p>

      <FieldGroup>
        <Field>
          <FieldLabel aria-invalid={!state.success} htmlFor="new-password">
            New password
          </FieldLabel>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoFocus
            required
            minLength={8}
            aria-invalid={!state.success}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password" aria-invalid={!state.success}>
            Confirm password
          </FieldLabel>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            aria-invalid={!state.success}
          />
        </Field>
      </FieldGroup>

      {state.error && <FieldError errors={[{ message: state.error }]} />}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
          Set password
        </Button>
      </div>
    </form>
  );
}
