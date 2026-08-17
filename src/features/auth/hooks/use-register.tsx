import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchema } from "../schemas/register-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

export function useRegister() {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: RegisterSchema) {
    await authClient.signUp.email({
      ...values,
      fetchOptions: {
        onSuccess: () => router.push("/"),
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
