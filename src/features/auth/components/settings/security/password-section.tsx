// features/auth/components/settings/security/password-section.tsx
"use client";

import { useState } from "react";
import { ChevronRight, KeyRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { useLinkedAccounts } from "../../../hooks/use-linked-accounts";
import { SetPasswordForm } from "./set-password-form";
import { ChangePasswordForm } from "./change-password-form";

export function PasswordSection() {
  const { data: session } = authClient.useSession();
  const { data: accounts, isLoading } = useLinkedAccounts();
  const [open, setOpen] = useState(false);

  if (!session || isLoading) return null;

  const hasPassword = (accounts ?? []).some(
    (a) => a.providerId === "credential",
  );

  return (
    <ItemGroup>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          render={
            <Item
              render={
                <button type="button">
                  <ItemContent>
                    <ItemTitle className="flex items-center gap-2">
                      <KeyRound className="size-4" />
                      Password
                    </ItemTitle>
                    <ItemDescription>
                      {hasPassword
                        ? "Used to sign in with your email and password"
                        : "Set a password to sign in without a social account"}
                    </ItemDescription>
                  </ItemContent>
                  <ItemMedia className="flex items-center gap-2">
                    {hasPassword ? (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        Set
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal">
                        Not set
                      </Badge>
                    )}
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        open && "rotate-90",
                      )}
                    />
                  </ItemMedia>
                </button>
              }
              className="cursor-pointer px-0"
            ></Item>
          }
        ></CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pb-4">
            {hasPassword ? (
              <ChangePasswordForm onDone={() => setOpen(false)} />
            ) : (
              <SetPasswordForm
                email={session.user.email}
                onDone={() => setOpen(false)}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ItemGroup>
  );
}
