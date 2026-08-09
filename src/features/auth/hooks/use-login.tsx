import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginSchema } from "../schemas/login-schema";

import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";

export function useLogin() {
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginSchema) {
    await authClient.signIn.email({
      ...values,
      fetchOptions: {
        onSuccess: () => router.push("/dashboard"),
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
