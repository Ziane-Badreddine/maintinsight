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
import { MailPlus, UserShieldIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export interface RoleOption {
  value: string;
  label: string;
}

interface RoleComboboxProps {
  options: RoleOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

const inviteUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  role: z.enum(["viewer", "inspector", "manager", "admin"]),
});

type InviteUserValues = z.infer<typeof inviteUserSchema>;

const ROLE_OPTIONS: RoleOption[] = [
  { value: "viewer", label: "Viewer" },
  { value: "inspector", label: "Inspector" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

export function InviteUserDialog() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InviteUserValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { name: "", email: "", role: "viewer" },
  });

  const isInviting = form.formState.isSubmitting;

  async function onSubmit(values: InviteUserValues) {
    // 1. Créer le compte avec le rôle voulu (mot de passe aléatoire, inutilisé)
    const { data: newUser, error: createError } =
      await authClient.admin.createUser({
        name: values.name,
        email: values.email,
        role: values.role,
      });

    if (createError || !newUser) {
      toast.add({
        type: "error",
        title: createError?.message ?? "Failed to invite user",
      });
      return;
    }

    // 2. Envoyer le lien magique d'invitation
    const { error: magicLinkError } = await authClient.signIn.magicLink({
      // newUserCallbackURL: "",
      email: values.email,
      name: values.name,
      callbackURL: "/dashboard",
      metadata: {
        type: "invite",
        role: values.role,
        name: values.name,
      },
    });

    if (magicLinkError) {
      toast.add({
        type: "error",
        title:
          magicLinkError.message ??
          "User created but invite email failed to send",
      });
      return;
    }

    toast.add({
      type: "success",
      title: `Invitation sent to ${values.email}`,
    });
    router.refresh();
    form.reset();
    setDialogOpen(false);
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
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Badr"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email */}
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

            {/* Role */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <RoleCombobox
                    options={ROLE_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
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

export function RoleCombobox({
  options,
  value,
  onChange,
  placeholder = "Select role...",
  disabled,
  className,
  ...props
}: RoleComboboxProps) {
  const anchorRef = useComboboxAnchor();

  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox<RoleOption>
      items={options}
      value={selected}
      onValueChange={(option) => {
        if (option) onChange(option.value);
      }}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <div ref={anchorRef}>
        <ComboboxInput
          placeholder={placeholder}
          disabled={disabled}
          className={cn("w-full", className)}
          {...props}
        >
          <InputGroupAddon>
            <UserShieldIcon />
          </InputGroupAddon>
        </ComboboxInput>
      </div>

      <ComboboxContent anchor={anchorRef} align="start" side="bottom">
        <ComboboxEmpty>No role found.</ComboboxEmpty>

        <ComboboxList>
          {(item: RoleOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
