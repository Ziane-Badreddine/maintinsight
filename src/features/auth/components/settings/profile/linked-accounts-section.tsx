"use client";

import { Loader2 } from "lucide-react";
import { ItemGroup } from "@/components/ui/item";
import { useLinkedAccounts } from "@/features/auth/hooks/use-linked-accounts";
import { SOCIAL_PROVIDERS } from "@/features/auth/constants/linked-providers";
import { SocialProviderRow } from "./social-provider-row";
import { CredentialsRow } from "./credentials-row";

export function LinkedAccountsSection() {
  const { data: accounts, isLoading } = useLinkedAccounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const linkedAccounts = accounts ?? [];
  const hasCredentials = linkedAccounts.some(
    (a) => a.providerId === "credential",
  );
  const linkedCount = linkedAccounts.length;

  return (
    <ItemGroup>
      {SOCIAL_PROVIDERS.map((provider) => {
        const linked = linkedAccounts.find((a) => a.providerId === provider.id);

        return (
          <div key={provider.id}>
            <SocialProviderRow
              provider={provider}
              linkedAccountId={linked?.accountId ?? null}
              canUnlink={linkedCount > 1}
            />
          </div>
        );
      })}

      <CredentialsRow
        hasCredentials={hasCredentials}
        canUnlink={linkedCount > 1}
      />
    </ItemGroup>
  );
}
