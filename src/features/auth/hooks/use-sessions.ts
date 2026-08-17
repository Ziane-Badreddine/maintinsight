// features/auth/hooks/use-sessions.ts
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions();
      if (error) throw error;
      return data;
    },
    // staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
};
