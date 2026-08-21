"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Fingerprint, GalleryVerticalEnd, MailboxIcon } from "lucide-react";
import { useLogin } from "../hooks/use-login";
import { Controller } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { useSyncExternalStore } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { form, onSubmit, isSubmitting } = useLogin();
  const [redirect] = useQueryState("redirect", parseAsString);
  const router = useRouter();

  const { isPending, mutate } = useMutation({
    mutationFn: async (options?: { autoFill?: boolean }) => {
      await authClient.signIn.passkey({
        autoFill: options?.autoFill ?? false,
      });
    },
    onSuccess: () => {
      router.push((redirect ?? "/dashboard") as Route);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Passkey sign-in failed",
        description: error.message ?? "Please try again",
      });
    },
  });

  const { isPending: isMagicLinkPending, mutate: sendMagicLink } = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: redirect ?? "/dashboard",
      });
      if (error) throw new Error(error.message ?? "Failed to send link");
    },
    onSuccess: (_, email) => {
      toast.add({
        type: "success",
        title: "Check your inbox",
        description: `We sent a sign-in link to ${email}`,
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Couldn't send magic link",
        description: error.message ?? "Please try again",
      });
    },
  });

  const lastMethod = useSyncExternalStore(
    () => () => {}, // no subscription needed, it's a static read
    () => authClient.getLastUsedLoginMethod(), // client snapshot
    () => null, // server snapshot
  );

  async function handleMagicLinkClick() {
    // Valide uniquement le champ email avant d'envoyer le lien
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) return;

    const email = form.getValues("email");
    sendMagicLink(email);
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
          <h1 className="text-xl font-bold">Welcome to Maintinsight.</h1>
          <FieldDescription>
            Login with your authorized account to continue.
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
                placeholder="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="rememberMe"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm text-muted-foreground"
              >
                Remember me
              </label>
            </div>
          )}
        />

        <Field className="relative">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(lastMethod === "email" && " ring-4 ring-primary/30")}
          >
            {isSubmitting && <Spinner />}
            Login
          </Button>
          {lastMethod === "email" && (
            <Badge className="inline-flex max-w-18 items-center gap-1 justify-center rounded-full text-xs  px-[5.5px] py-[3px] border border-brand-500 absolute -right-4 -top-3 shadow-sm z-10 pointer-events-none">
              Last used
            </Badge>
          )}
        </Field>
        <FieldSeparator>Or</FieldSeparator>
        <Field className="relative">
          <Button
            type="button"
            variant="outline"
            className={cn(
              lastMethod === "passkey" &&
                " ring-4 ring-background dark:ring-input/30",
            )}
            onClick={() => mutate({})}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <Fingerprint className="size-4" />}
            Sign in with a passkey
          </Button>
          {lastMethod === "passkey" && (
            <Badge
              variant={"outline"}
              className="inline-flex max-w-18 items-center gap-1 justify-center rounded-full text-xs  px-[5.5px] py-[3px] border absolute backdrop-blur-3xl -right-4 -top-3 shadow-sm z-10 text-foreground pointer-events-none"
            >
              Last used
            </Badge>
          )}
        </Field>

        <Field className="relative">
          <Button
            type="button"
            variant="outline"
            className={cn(
              lastMethod === "magic-link" &&
                " ring-4 ring-background dark:ring-input/30",
            )}
            onClick={handleMagicLinkClick}
            disabled={isMagicLinkPending}
          >
            {isMagicLinkPending ? (
              <Spinner />
            ) : (
              <MailboxIcon className="size-4" />
            )}
            Sign in with a magic link
          </Button>
          {lastMethod === "magic-link" && (
            <Badge
              variant={"outline"}
              className="inline-flex max-w-18 items-center gap-1 justify-center rounded-full text-xs  px-[5.5px] py-[3px] border absolute backdrop-blur-3xl -right-4 -top-3 shadow-sm z-10 text-foreground pointer-events-none"
            >
              Last used
            </Badge>
          )}
        </Field>
      </FieldGroup>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </form>
  );
}
