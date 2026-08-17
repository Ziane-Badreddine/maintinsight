"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import Link from "next/link";
import { Route } from "next";

import { Spinner } from "@/components/ui/spinner";
import { Fingerprint, GalleryVerticalEnd } from "lucide-react";
import { useLogin } from "../hooks/use-login";
import { Controller } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { form, onSubmit, isSubmitting } = useLogin();
  const router = useRouter();

  const { isPending, mutate } = useMutation({
    mutationFn: async (options?: { autoFill?: boolean }) => {
      await authClient.signIn.passkey({
        autoFill: options?.autoFill ?? false,
      });
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Passkey sign-in failed",
        description: error.message ?? "Please try again",
      });
    },
  });
  const lastMethod = authClient.getLastUsedLoginMethod();
  console.log(lastMethod);

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
          <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
          <FieldDescription>
            Don&apos;t have an account? <Link href="/register">Register</Link>
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
                autoComplete="username webauthn"
                className="bg-background"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href={"/forgot-password" as Route}
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                {...field}
                id="password"
                aria-invalid={fieldState.invalid}
                type="password"
                autoComplete="current-password webauthn"
                className="bg-background"
                placeholder="*********"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Login
          </Button>
        </Field>
        <FieldSeparator>Or</FieldSeparator>
        <Field>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => mutate({})}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <Fingerprint className="size-4" />}
            Sign in with a passkey
          </Button>
        </Field>
      </FieldGroup>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </form>
  );
}
