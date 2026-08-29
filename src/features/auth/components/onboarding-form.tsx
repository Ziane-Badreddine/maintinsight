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
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/toast";

import { completeOnboarding } from "../actions/complete-onboarding";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import Logo from "@/assets/logo.svg";

const onboardingSchema = z
  .object({
    name: z.string().trim().min(2, "Name must contain at least 2 characters"),

    password: z.string().min(8, "Password must contain at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: OnboardingValues) {
    const result = await completeOnboarding({
      name: values.name,
      password: values.password,
    });

    if (!result.success) {
      toast.add({
        type: "error",
        title: "Unable to complete onboarding",
        description: result.error ?? "Please try again.",
      });

      return;
    }

    toast.add({
      type: "success",
      title: "Account ready",
      description: "Your MaintInsight account has been created successfully.",
    });

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form
      id="onboarding-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <Logo className="size-8" title="maintinsight" />
            </div>

            <span className="sr-only">MaintInsight</span>
          </Link>

          <h1 className="text-xl font-bold">Welcome to MaintInsight.</h1>

          <FieldDescription>
            Complete your account setup to get started.
          </FieldDescription>
        </div>

        {/* First name */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="firstName">Name</FieldLabel>

              <Input
                {...field}
                id="firstName"
                type="text"
                placeholder="John"
                autoComplete="given-name"
                aria-invalid={fieldState.invalid}
                className="bg-background"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id="password"
                  aria-invalid={fieldState.invalid}
                  type={isPasswordHidden ? "password" : "text"}
                  autoComplete="current-password webauthn"
                  className="bg-background"
                  placeholder="password"
                />
                <InputGroupAddon align={"inline-end"}>
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => {
                      setIsPasswordHidden(!isPasswordHidden);
                    }}
                  >
                    {isPasswordHidden ? <Eye /> : <EyeOff />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldDescription>Use at least 8 characters.</FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Confirm password */}
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>

              <Input
                {...field}
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                className="bg-background"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Submit */}
        <Field>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Spinner />}
            Complete account
          </Button>
        </Field>
      </FieldGroup>

      <FieldDescription className="px-6 text-center">
        By creating your account, you agree to our{" "}
        <a href="#" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </form>
  );
}
