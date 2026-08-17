"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

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
import { ChangeEmailForm } from "./change-email-form";

export function EmailSection() {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const { user } = session;

  return (
    <ItemGroup>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          render={
            <Item
              render={
                <button type="button">
                  <ItemContent>
                    <ItemTitle>Email address</ItemTitle>
                    <ItemDescription>
                      Used to sign in and receive notifications
                    </ItemDescription>
                  </ItemContent>
                  <ItemMedia className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    {user.emailVerified ? (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal">
                        Unverified
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
            <ChangeEmailForm
              currentEmail={user.email}
              onDone={() => setOpen(false)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ItemGroup>
  );
}
