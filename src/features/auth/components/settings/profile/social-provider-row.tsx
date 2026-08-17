"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { SOCIAL_PROVIDERS } from "@/features/auth/constants/linked-providers";

interface SocialProviderRowProps {
  provider: (typeof SOCIAL_PROVIDERS)[number];
  linkedAccountId: string | null;
  canUnlink: boolean;
}

export function SocialProviderRow({
  provider,
  linkedAccountId,
  canUnlink,
}: SocialProviderRowProps) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isLinked = Boolean(linkedAccountId);

  async function handleConnect() {
    setIsPending(true);
    const { error } = await authClient.linkSocial({
      provider: provider.id,
      callbackURL: "/dashboard",
    });
    setIsPending(false);

    if (error) {
      toast.add({
        type: "error",
        title: `Failed to connect ${provider.name}`,
        description: error.message ?? "Please try again",
      });
    }
    // en cas de succès, better-auth redirige vers le provider OAuth,
    // donc pas besoin de gérer un état "success" ici.
  }

  async function handleDisconnect() {
    setIsPending(true);
    const { error } = await authClient.unlinkAccount({
      providerId: provider.id,
    });
    setIsPending(false);
    setConfirmOpen(false);

    if (error) {
      toast.add({
        type: "error",
        title: `Failed to disconnect ${provider.name}`,
        description: error.message ?? "Please try again",
      });
      return;
    }

    toast.add({ type: "success", title: `${provider.name} disconnected` });
    queryClient.invalidateQueries({ queryKey: ["linked-accounts"] });
  }

  return (
    <>
      <Item size="sm" className="px-0">
        <ItemContent>
          <ItemTitle className="flex items-center gap-2">
            <provider.icon className="size-4" />
            {provider.name}
          </ItemTitle>
        </ItemContent>

        <ItemMedia className="flex items-center gap-2">
          {isLinked ? (
            <>
              <Badge variant="secondary" className="text-xs font-normal">
                Connected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending || !canUnlink}
                onClick={() => setConfirmOpen(true)}
                title={
                  !canUnlink
                    ? "You need at least one other sign-in method"
                    : undefined
                }
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={handleConnect}
            >
              {isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Connect
            </Button>
          )}
        </ItemMedia>
      </Item>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {provider.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll no longer be able to sign in using {provider.name}.
              You can reconnect it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
