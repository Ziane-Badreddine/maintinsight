import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginSchema } from "../schemas/login-schema";

import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { parseAsString, useQueryState } from "nuqs";
import { Route } from "next";

export function useLogin() {
  const router = useRouter();
  const [redirect] = useQueryState("redirect", parseAsString);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginSchema) {
    await authClient.signIn.email({
      ...values,
      fetchOptions: {
        onSuccess: () => router.push((redirect ?? "/dashboard") as Route),
        onError: (ctx) => {
          toast.add({
            type: "error",
            title: ctx.error.message,
          });
        },
      },
    });
  }

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}
