"use client";

import { useMutation } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await authClient.twoFactor.enable({
        password,
      });
      return data; // { totpURI, backupCodes }
    },
  });
}

export function useVerifyTotp() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      });
      return data;
    },
  });
}

export function useDisableTwoFactor() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await authClient.twoFactor.disable({ password });
      return data;
    },
  });
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      return data; // { backupCodes }
    },
  });
}
