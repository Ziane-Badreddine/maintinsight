// features/auth/components/settings/display-name-form.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface DisplayNameFormProps {
  defaultValue: string;
  onDone: () => void;
}

export function DisplayNameForm({
  defaultValue,
  onDone,
}: DisplayNameFormProps) {
  const [name, setName] = useState(defaultValue);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const { error: updateError } = await authClient.updateUser({
      name: name.trim(),
    });

    setIsPending(false);

    if (updateError) {
      setError(updateError.message ?? "Something went wrong.");
      return;
    }

    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3  p-4 rounded  border">
      <FieldGroup>
        <Field data-invalid={error}>
          <FieldLabel htmlFor="display-name">New name</FieldLabel>
          <Input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <FieldError errors={[{ message: error! }]} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
}
