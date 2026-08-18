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
import { useRegister } from "../hooks/use-register";
import { Controller } from "react-hook-form";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { form, onSubmit, isSubmitting } = useRegister();

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      id="signup-form"
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
            Already have an account? <Link href="/login">Login</Link>
          </FieldDescription>
        </div>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder="John Doe"
                className="bg-background"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
                autoComplete="off"
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                {...field}
                id="password"
                aria-invalid={fieldState.invalid}
                type="password"
                className="bg-background"
                placeholder="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            Create Account
          </Button>
        </Field>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
