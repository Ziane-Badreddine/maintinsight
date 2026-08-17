// features/auth/components/settings/security.tsx
"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordSection } from "./security/password-section";
import { PasskeysSection } from "./security/passkeys-section";
import { SessionsSection } from "./security/sessions-section";
import { DeleteAccountSection } from "./security/delete-account-section";

export function Security() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("password");

  if (!session) return null;

  return (
    <div className="max-w-2xl flex flex-col gap-2">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-2 sticky top-0 bg-transparent border-b z-10"
      >
        <TabsList variant="line">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="passkeys">Passkeys</TabsTrigger>
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="delete-account">Delete account</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "password" && <PasswordSection />}
      {activeTab === "passkeys" && <PasskeysSection />}
      {activeTab === "sessions" && <SessionsSection />}
      {activeTab === "delete-account" && <DeleteAccountSection />}
    </div>
  );
}
