"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "nuqs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { X, Plus, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUsersFilters } from "./searchParams";
import { toast } from "@/components/ui/toast";
import { RoleCombobox } from "./role-combobox";
import { StatusCombobox } from "./status-combobox";
import { InviteUserDialog } from "./invite-user-dialog";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["viewer", "inspector", "manager", "admin"]),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

export function UsersToolbar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [{ search, role, status }, setFilters] = useUsersFilters({
    startTransition,
  });

  const hasFilters = search !== "" || role !== "all" || status !== "all";

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "viewer" },
  });

  const isCreating = form.formState.isSubmitting;

  async function onSubmit(values: CreateUserValues) {
    await authClient.admin.createUser({
      ...values,
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            type: "success",
            title: "User created successfully",
          });
          router.refresh(); // re-stream the UsersSection with new data
          form.reset();
          setDialogOpen(false);
        },
        onError: (ctx) => {
          toast.add({
            type: "error",
            title: ctx.error.message,
          });
        },
      },
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search — InputGroup with loading/clear addon */}
      <InputGroup className="w-full md:w-64">
        <InputGroupInput
          placeholder="Search by name..."
          value={search}
          onChange={(e) =>
            setFilters(
              { search: e.target.value || null, page: 1 },
              { limitUrlUpdates: debounce(300) },
            )
          }
        />
        <InputGroupAddon>
          {isPending ? (
            <Loader2 className=" animate-spin text-muted-foreground" />
          ) : search ? (
            <InputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => setFilters({ search: null, page: 1 })}
              aria-label="Clear search"
            >
              <X className="" />
            </InputGroupButton>
          ) : (
            <Search className=" text-muted-foreground" />
          )}
        </InputGroupAddon>
      </InputGroup>

      <RoleCombobox />

      <StatusCombobox />

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setFilters({
                search: null,
                role: null,
                status: null,
                page: 1,
              });
            })
          }
        >
          <X className="size-4 mr-1" />
          Clear
        </Button>
      )}

      <div className="flex items-center justify-end gap-2 ml-auto">
        <InviteUserDialog />

        {/* Add User dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="md:ml-auto">
                <Plus className="size-4" />
                Add user
              </Button>
            }
          ></DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add user</DialogTitle>
            </DialogHeader>

            <form
              id="create-user-admin-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 "
            >
              {/* Name */}
              <FieldGroup>
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Password */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>Minimum 8 characters.</FieldDescription>
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
                      <FieldLabel htmlFor="cu-role">Role</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="cu-role"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="inspector">Inspector</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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
                disabled={isCreating}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="create-user-admin-form"
                disabled={isCreating}
              >
                {isCreating && <Spinner className="size-4" />}
                Create user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
