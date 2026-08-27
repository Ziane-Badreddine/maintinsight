// features/auth/components/settings/security.tsx
"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordSection } from "./security/password-section";
import { PasskeysSection } from "./security/passkeys-section";
import { SessionsSection } from "./security/sessions-section";
import { DeleteAccountSection } from "./security/delete-account-section";
import TwoFactorSection from "./security/two-factor-section";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Security() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("password");

  if (!session) return null;

  return (
    <div className="max-w-2xl flex flex-col gap-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          variant="line"
          className="mb-2 sticky top-0 bg-transparent z-10"
        >
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="passkeys">Passkeys</TabsTrigger>
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="delete-account">Delete account</TabsTrigger>
        </TabsList>
        <ScrollArea className={"h-[calc(480px-80px+16px)] pr-4"}>
          <TabsContent value={"password"}>
            <PasswordSection />
          </TabsContent>
          <TabsContent value={"passkeys"}>
            <PasskeysSection />
          </TabsContent>
          <TabsContent value={"2fa"}>
            <TwoFactorSection />
          </TabsContent>
          <TabsContent value={"sessions"}>
            <SessionsSection />
          </TabsContent>
          <TabsContent value={"delete-account"}>
            <DeleteAccountSection />
          </TabsContent>
        </ScrollArea>
      </Tabs>
      {/* 
      {activeTab === "password" && <PasswordSection />}
      {activeTab === "passkeys" && <PasskeysSection />}
      {activeTab === "sessions" && <SessionsSection />}
      {activeTab === "delete-account" && <DeleteAccountSection />} */}
    </div>
  );
}
