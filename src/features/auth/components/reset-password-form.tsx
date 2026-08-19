"use client";

import { Controller, useForm } from "react-hook-form";
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "../schemas/reset-password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      token,
    },
  });
  const router = useRouter();
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ResetPasswordSchema) {
    const { newPassword, token } = values;
    await authClient.resetPassword({
      newPassword,
      token,

      fetchOptions: {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.add({
            type: "error",
            title: "Password reset failed",
            description: ctx.error.message ?? "Please try again",
          });
          router.push("/forgot-password");
        },
      },
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      id="reset-password-form"
      className="flex flex-col gap-6 items-center"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </Link>
          <h1 className="text-xl font-bold">Reset password</h1>
          <FieldDescription className="text-center">
            Enter your new password and confirm it to reset your password
          </FieldDescription>
        </div>
        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field className="relative">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Reset password
          </Button>
        </Field>
      </FieldGroup>
      <Link href="/login">
        <Button
          variant={"link"}
          className={"text-muted-foreground hover:text-foreground"}
        >
          Back to login
        </Button>
      </Link>
    </form>
  );
}
