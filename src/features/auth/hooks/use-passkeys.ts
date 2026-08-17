"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function usePasskeys() {
  return useQuery({
    queryKey: ["passkeys"],
    queryFn: async () => {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (error) throw error;
      return data;
    },
  });
}
