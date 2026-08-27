"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ItemGroup } from "@/components/ui/item";
import { useSessions } from "../../../hooks/use-sessions";

export function SessionsSection() {
  const { data: session } = authClient.useSession();
  const { data: sessions, isLoading } = useSessions();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allSessions = sessions ?? [];
  const currentSessionToken = session?.session.token;
  const otherSessionsCount = allSessions.filter(
    (s) => s.token !== currentSessionToken,
  ).length;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Devices currently signed in to your account.
        </p>
        {otherSessionsCount > 0 && (
          <RevokeAllSessionsButton onRevoked={invalidate} />
        )}
      </div>

      <ItemGroup>
        {allSessions.map((s) => (
          <div key={s.id}>
            <SessionRow
              token={s.token}
              userAgent={s.userAgent}
              ipAddress={s.ipAddress}
              updatedAt={s.updatedAt}
              isCurrent={s.token === currentSessionToken}
              onRevoked={invalidate}
            />
          </div>
        ))}
      </ItemGroup>
    </div>
  );
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { SessionRow } from "./session-row";

interface RevokeSessionButtonProps {
  token: string;
  onRevoked: () => void;
}

export function RevokeSessionButton({
  token,
  onRevoked,
}: RevokeSessionButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleRevoke() {
    setIsPending(true);
    const { error } = await authClient.revokeSession({ token });
    setIsPending(false);
    setOpen(false);

    if (error) {
      toast.add({
        type: "error",
        title: "Failed to revoke session",
        description: error.message ?? "Please try again",
      });
      return;
    }

    toast.add({ type: "success", title: "Session revoked" });
    onRevoked();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="secondary" size={"sm"}>
            Revoke
          </Button>
        }
      ></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
          <AlertDialogDescription>
            This device will be signed out immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevoke} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Revoke
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface RevokeAllSessionsButtonProps {
  onRevoked: () => void;
}

export function RevokeAllSessionsButton({
  onRevoked,
}: RevokeAllSessionsButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleRevokeAll() {
    setIsPending(true);
    const { error } = await authClient.revokeOtherSessions();
    setIsPending(false);
    setOpen(false);

    if (error) {
      toast.add({
        type: "error",
        title: "Failed to revoke sessions",
        description: error.message ?? "Please try again",
      });
      return;
    }

    toast.add({ type: "success", title: "All other sessions revoked" });
    onRevoked();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            Sign out other devices
          </Button>
        }
      ></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out all other devices?</AlertDialogTitle>
          <AlertDialogDescription>
            This will sign you out everywhere except this device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRevokeAll} disabled={isPending}>
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
