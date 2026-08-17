"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export function AddPasskeyDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.passkey.addPasskey({
        name: name.trim() || undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.add({ type: "success", title: "Passkey added" });
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      setOpen(false);
      setName("");
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to add passkey",
        description: error.message ?? "Please try again",
      });
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setName("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button>Add passkey</Button>}></DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add a passkey</DialogTitle>
          <DialogDescription>
            Give it a name so you can recognize it later, like &quot;My
            laptop&quot; or &quot;Work phone&quot;.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="passkey-name">Name</FieldLabel>
            <Input
              id="passkey-name"
              placeholder="My laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  mutate();
                }
              }}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={() => mutate()} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
