"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useLinkedAccounts() {
  return useQuery({
    queryKey: ["linked-accounts"],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();
      if (error) throw error;
      return data;
    },
  });
}
