"use client";

import { useState } from "react";
import { KeyRound, Loader2, MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { toast } from "@/components/ui/toast";

interface CredentialsRowProps {
  hasCredentials: boolean;
  canUnlink: boolean;
}

export function CredentialsRow({ hasCredentials }: CredentialsRowProps) {
  const { data: session } = authClient.useSession();
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSetPassword() {
    if (!session?.user.email) return;

    setIsPending(true);
    // const { error } = await authClient.resetPassword({
    //   email: session.user.email,
    //   redirectTo: "/reset-password",
    // });
    setIsPending(false);

    // if (error) {
    //   toast.add({
    //     type: "error",
    //     title: "Failed to send reset link",
    //     description: error.message ?? "Please try again",
    //   });
    //   return;
    // }

    setSent(true);
    toast.add({
      type: "success",
      title: "Check your inbox",
      description: "We sent you a link to set your password.",
    });
  }

  return (
    <Item size="sm" className="px-0">
      <ItemContent>
        <ItemTitle className="flex items-center gap-2">
          <KeyRound className="size-4" />
          Email &amp; password
        </ItemTitle>
      </ItemContent>

      <ItemMedia className="flex items-center gap-2">
        {hasCredentials ? (
          <Badge variant="secondary" className="text-xs font-normal">
            Password set
          </Badge>
        ) : sent ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MailCheck className="size-3.5" />
            Link sent
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleSetPassword}
          >
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Set password
          </Button>
        )}
      </ItemMedia>
    </Item>
  );
}
