"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { MailPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

const inviteUserSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type InviteUserValues = z.infer<typeof inviteUserSchema>;

export function InviteUserDialog() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InviteUserValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { email: "" },
  });

  const isInviting = form.formState.isSubmitting;

  async function onSubmit(values: InviteUserValues) {
    await authClient.signIn.magicLink({
      newUserCallbackURL: "/onboarding",
      email: values.email,
      callbackURL: "/dashboard",
      metadata: {
        type: "invite",
      },
      fetchOptions: {
        onError: (ctx) => {
          toast.add({
            type: "error",
            title:
              ctx.error.message ??
              "User created but invite email failed to send",
          });
        },
        onSuccess: () => {
          toast.add({
            type: "success",
            title: `Invitation sent to ${values.email}`,
          });
          router.refresh();
          form.reset();
          setDialogOpen(false);
        },
      },
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <MailPlus className="size-4" />
            Invite user
          </Button>
        }
      ></DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>

        <form
          id="invite-user-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="badr@turathn.ma"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <FieldDescription>
                    An invitation link will be sent to this address.
                  </FieldDescription>
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
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setDialogOpen(false);
            }}
            disabled={isInviting}
          >
            Cancel
          </Button>

          <Button type="submit" form="invite-user-form" disabled={isInviting}>
            {isInviting && <Spinner className="size-4" />}
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
