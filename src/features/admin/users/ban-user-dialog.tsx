/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";

const banSchema = z.object({
  banReason: z.string().min(1, "Please provide a reason for the ban."),
  banDate: z.date().optional(),
  banTime: z.string().optional(),
});

type BanValues = z.infer<typeof banSchema>;

function toBanExpiresIn(
  date: Date | undefined,
  time: string | undefined,
): number | undefined {
  if (!date) return undefined;

  const [hours = "0", minutes = "0", seconds = "0"] = (
    time ?? "00:00:00"
  ).split(":");
  const expiry = new Date(date);
  expiry.setHours(Number(hours), Number(minutes), Number(seconds), 0);

  const diff = Math.floor((expiry.getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : undefined;
}

interface BanUserDialogProps {
  user: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Controlled ban confirmation dialog. No trigger rendered — the parent
 * owns `open`/`onOpenChange` and is responsible for rendering this
 * OUTSIDE of any component that unmounts (e.g. a DropdownMenuContent).
 */
export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: BanUserDialogProps) {
  const router = useRouter();
  const [calOpen, setCalOpen] = React.useState(false);

  const form = useForm<BanValues>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      banReason: "",
      banDate: undefined,
      banTime: "00:00:00",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: BanValues) {
    if (!user) return;
    const banExpiresIn = toBanExpiresIn(values.banDate, values.banTime);

    await authClient.admin.banUser({
      userId: user.id,
      banReason: values.banReason,
      ...(banExpiresIn !== undefined ? { banExpiresIn } : {}),
      fetchOptions: {
        onSuccess: () => {
          toast.add({
            type: "success",
            title: `${user.name} has been banned`,
          });
          router.refresh();
          onOpenChange(false);
          form.reset();
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

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) form.reset();
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ban {user?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent them from signing in and revoke all their existing
            sessions. You can unban them at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          id="ban-user-form-admin"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 p-4 "
        >
          {/* Ban reason */}

          {/* Expiry: date + time */}
          <FieldGroup>
            <Controller
              name="banReason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ban-reason">Reason</FieldLabel>
                  <Input
                    {...field}
                    id="ban-reason"
                    placeholder="e.g. Spamming, abusive behaviour…"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="banDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="flex-1">
                  <FieldLabel htmlFor="ban-date">
                    Expires on{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          id="ban-date"
                          variant="outline"
                          className="w-full justify-between font-normal"
                          aria-invalid={fieldState.invalid}
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <ChevronDownIcon className="size-4 opacity-50" />
                        </Button>
                      }
                    ></PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        defaultMonth={field.value ?? new Date()}
                        disabled={(d) => d < new Date()}
                        onSelect={(d) => {
                          field.onChange(d);
                          setCalOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>
                    Leave empty for a permanent ban.
                  </FieldDescription>
                </Field>
              )}
            />

            {form.watch("banDate") && (
              <Controller
                name="banTime"
                control={form.control}
                render={({ field }) => (
                  <Field className="w-32 shrink-0 mb-auto">
                    <FieldLabel htmlFor="ban-time">Time</FieldLabel>
                    <Input
                      {...field}
                      id="ban-time"
                      type="time"
                      step="1"
                      className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              form.reset();
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            form="ban-user-form-admin"
            type="submit"
            variant="destructive"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner className="size-4" />}
            Ban user
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
