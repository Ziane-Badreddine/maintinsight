// features/auth/hooks/use-verify-two-factor.ts
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Route } from "next";

import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

const schema = z.object({
  code: z.string().min(1, "Code is required"),
});

type FormValues = z.infer<typeof schema>;

export function useVerifyTwoFactor(redirect: string | null) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      code,
      isBackupCode,
    }: FormValues & { isBackupCode: boolean }) => {
      const { error } = isBackupCode
        ? await authClient.twoFactor.verifyBackupCode({
            code,
          })
        : await authClient.twoFactor.verifyTotp({ code });
      if (error) throw new Error(error.message ?? "Invalid code");
    },
    onSuccess: () => {
      router.push((redirect ?? "/dashboard") as Route);
    },
    onError: (error) => {
      form.setError("code", { message: error.message });
      toast.add({
        type: "error",
        title: "Verification failed",
        description: error.message,
      });
      form.reset();
    },
  });

  async function onSubmit(values: FormValues, isBackupCode: boolean) {
    await mutateAsync({ ...values, isBackupCode });
  }

  return { form, onSubmit, isSubmitting: isPending };
}
