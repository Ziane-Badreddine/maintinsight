// features/auth/components/settings/security/two-factor-section.tsx
"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { ItemGroup } from "@/components/ui/item";

import { EnableTwoFactorDialog } from "./enable-two-factor-dialog";
import { AuthenticatorAppItem } from "./authenticator-app-item";
import { BackupCodesItem } from "./backup-codes-item";

export default function TwoFactorSection() {
  const { data: session } = authClient.useSession();
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const enabled = !!session?.user?.twoFactorEnabled;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add an extra layer of security by requiring a code from your
        authenticator app when signing in.
      </p>
      <div className={enabled ? undefined : "hidden"}>
        <ItemGroup>
          <AuthenticatorAppItem />
          <BackupCodesItem
            backupCodes={backupCodes}
            onBackupCodesGenerated={setBackupCodes}
          />
        </ItemGroup>
      </div>

      <div className={enabled ? "hidden" : undefined}>
        <ItemGroup>
          <AuthenticatorAppItem
            trigger={
              <EnableTwoFactorDialog
                onEnabled={(codes) => setBackupCodes(codes)}
              />
            }
          />
        </ItemGroup>
      </div>
    </div>
  );
}
