// providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";

interface ApiError {
  status?: number;
  statusCode?: number;
  code?: string;
  name?: string;
}

function shouldNotRetry(error: unknown) {
  const err = error as ApiError;

  // 404 — la ressource/route n'existe pas, réessayer ne changera rien
  if (err?.status === 404 || err?.statusCode === 404) {
    return true;
  }

  // Auth/validation errors — pas la peine de réessayer non plus
  if (
    err?.name === "UnauthorizedError" ||
    err?.name === "ValidationError" ||
    err?.status === 401 ||
    err?.status === 403 ||
    err?.status === 400
  ) {
    return true;
  }

  return false;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: (failureCount, error) => {
          if (shouldNotRetry(error)) return false;
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: (failureCount, error) => {
          if (shouldNotRetry(error)) return false;
          return failureCount < 1;
        },
      },
    },
  });
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
