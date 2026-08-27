// features/auth/components/settings/security/authenticator-app-item.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldOff, ShieldX } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import { DisableTwoFactorDialog } from "./disable-two-factor-dialog";

interface AuthenticatorAppItemProps {
  // When 2FA is disabled, the section passes the Enable dialog's trigger
  // button here instead of rendering the "manage" dropdown.
  trigger?: React.ReactNode;
}

export function AuthenticatorAppItem({ trigger }: AuthenticatorAppItemProps) {
  const { data: session } = authClient.useSession();
  const [removeOpen, setRemoveOpen] = useState(false);

  const enabled = !!session?.user?.twoFactorEnabled;

  return (
    <>
      <Item className="px-0">
        <ItemMedia>
          {enabled ? (
            <ShieldCheck className="size-5 text-green-600" />
          ) : (
            <ShieldOff className="size-5 text-muted-foreground" />
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="flex items-center gap-2">
            Authenticator app
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </ItemTitle>
          <ItemDescription>
            Use an app like Google Authenticator or 1Password to generate codes.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <div className={enabled ? "hidden" : undefined}>{trigger}</div>
          <div className={enabled ? undefined : "hidden"}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setTimeout(() => setRemoveOpen(true), 0);
                  }}
                >
                  <ShieldX className="size-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* {enabled ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setTimeout(() => setRemoveOpen(true), 0);
                  }}
                >
                  <ShieldX className="size-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            trigger
          )} */}
        </ItemActions>
      </Item>

      <DisableTwoFactorDialog open={removeOpen} onOpenChange={setRemoveOpen} />
    </>
  );
}
