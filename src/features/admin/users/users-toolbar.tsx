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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { X, Plus, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUsersFilters } from "./searchParams";
import { toast } from "@/components/ui/toast";

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
          disabled={isPending}
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

      {/* Role */}
      <Select
        value={role}
        onValueChange={(v) =>
          startTransition(async () => {
            await setFilters({ role: v, page: 1 });
          })
        }
        disabled={isPending}
      >
        <SelectTrigger className="h-9 w-32">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="inspector">Inspector</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={status}
        onValueChange={(v) =>
          startTransition(async () => {
            await setFilters({ status: v, page: 1 });
          })
        }
        disabled={isPending}
      >
        <SelectTrigger className="h-9 w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="banned">Banned</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="outline"
          className="h-9 px-2"
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

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="cu-name">Full name</FieldLabel>
                  <Input
                    {...field}
                    id="cu-name"
                    placeholder="Fatima Zahra"
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
                  <FieldLabel htmlFor="cu-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="cu-email"
                    type="email"
                    placeholder="fatima@turathn.ma"
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
                  <FieldLabel htmlFor="cu-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="cu-password"
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

            <div className="flex justify-end gap-2 pt-2">
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
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Spinner className="size-4" />}
                Create user
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
