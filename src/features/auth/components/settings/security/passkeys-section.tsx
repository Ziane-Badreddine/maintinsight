"use client";

import { Loader2 } from "lucide-react";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { usePasskeys } from "../../../hooks/use-passkeys";

import { PasskeyRow } from "./passkey-row";
import { AddPasskeyDialog } from "./add-passkey-button";

export function PasskeysSection() {
  const { data: passkeys, isLoading } = usePasskeys();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const list = passkeys ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Sign in without a password using your device&apos;s biometrics or
          security key.
        </p>
      </div>

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No passkeys added yet.
        </p>
      ) : (
        <ItemGroup>
          {list.map((passkey, i) => (
            <div key={passkey.id}>
              <PasskeyRow
                id={passkey.id}
                name={passkey.name!}
                createdAt={passkey.createdAt}
                deviceType={passkey.deviceType}
              />
              {i < list.length - 1 && <ItemSeparator />}
            </div>
          ))}
        </ItemGroup>
      )}
      <AddPasskeyDialog />
    </div>
  );
}
