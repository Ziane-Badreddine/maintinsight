"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import Link from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { GalleryVerticalEnd } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
} from "../schemas/forgot-password-schema";
import { zodResolver } from "@hookform/resolvers/zod";

export function ForgotPasswordFrom({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ForgotPasswordSchema) {
    await authClient.requestPasswordReset({
      ...values,
      redirectTo: "/reset-password",
      fetchOptions: {
        onSuccess: () => {
          router.push("/forgot-password/success");
        },
        onError: (ctx) => {
          toast.add({
            type: "error",
            title: "Passkey sign-in failed",
            description: ctx.error.message ?? "Please try again",
          });
        },
      },
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      id="login-form"
      className={cn("flex flex-col gap-6", className)}
      {...props}
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
          <h1 className="text-xl font-bold">Forgot Your Password</h1>
          <FieldDescription className=" text-center">
            Type in your email and we&apos;ll send you a link to reset your
            password
          </FieldDescription>
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="m@example.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field className="relative">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Send reset email
          </Button>
        </Field>
      </FieldGroup>
      <FieldDescription className="px-6 text-center">
        Already have an account? <Link href="/login">Login</Link>
      </FieldDescription>
    </form>
  );
}
