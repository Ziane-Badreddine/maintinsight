// features/auth/components/settings/profile-details.tsx
"use client";

import { useState } from "react";
import { ChevronRight, User } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { DisplayNameForm } from "./profile/display-name-form";
import AvatarForm from "./profile/avatar-form";
import { EmailSection } from "./profile/email-section";
import { LinkedAccountsSection } from "./profile/linked-accounts-section";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProfileDetails() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [openRow, setOpenRow] = useState<"displayName" | "avatar" | null>(null);

  if (!session) return null;

  const { user } = session;

  function toggleRow(row: "displayName" | "avatar") {
    setOpenRow((current) => (current === row ? null : row));
  }

  return (
    <div className="max-w-2xl flex flex-col gap-2">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-2 sticky top-0 bg-transparent  z-10"
      >
        <TabsList variant="line">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="linked-accounts">Linked accounts</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className={"h-[calc(480px-80px+16px)] pr-4"}>
        {activeTab === "profile" && (
          <ItemGroup>
            {/* Display name row */}
            <Collapsible
              open={openRow === "displayName"}
              onOpenChange={() => toggleRow("displayName")}
            >
              <CollapsibleTrigger
                render={
                  <Item
                    render={
                      <button type="button">
                        <ItemContent>
                          <ItemTitle>Display name</ItemTitle>
                          <ItemDescription>
                            Changing your display name won&apos;t change your
                            username
                          </ItemDescription>
                        </ItemContent>
                        <ItemMedia className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {user.name}
                          </span>
                          <ChevronRight
                            className={cn(
                              "size-4 text-muted-foreground transition-transform group/item-hover:bg-secondary ",
                              openRow === "displayName" && "rotate-90",
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
                <div className=" pb-4">
                  <DisplayNameForm
                    defaultValue={user.name ?? ""}
                    onDone={() => setOpenRow(null)}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Avatar row */}
            <Collapsible
              open={openRow === "avatar"}
              onOpenChange={() => toggleRow("avatar")}
            >
              <CollapsibleTrigger
                render={
                  <Item
                    render={
                      <button type="button">
                        <ItemContent>
                          <ItemTitle>Avatar</ItemTitle>
                          <ItemDescription>
                            Edit your avatar or upload an image
                          </ItemDescription>
                        </ItemContent>
                        <ItemMedia className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={session.user.image ?? "/avatar.png"}
                              alt={session.user.name ?? "User"}
                            />
                            <AvatarFallback className={"bg-foreground"}>
                              <User className="text-primary-foreground size-4.5" />
                            </AvatarFallback>
                          </Avatar>
                          <ChevronRight
                            className={cn(
                              "size-4 text-muted-foreground transition-transform",
                              openRow === "avatar" && "rotate-90",
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
                <div className=" pb-4">
                  <AvatarForm />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ItemGroup>
        )}

        {activeTab === "email" && <EmailSection />}
        {activeTab === "linked-accounts" && <LinkedAccountsSection />}
      </ScrollArea>
    </div>
  );
}
