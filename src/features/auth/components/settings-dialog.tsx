"use client";

import * as React from "react";
import { Lock, Settings, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ProfileDetails } from "./settings/profile-details";

import { Preferences } from "./settings/preferences";
import { Security } from "./settings/security";

type SettingsSection = "profile" | "security" | "preferences";

const NAV: { key: SettingsSection; name: string; icon: React.ElementType }[] = [
  { key: "profile", name: "Profile details", icon: User },
  { key: "security", name: "Security", icon: Lock },
  { key: "preferences", name: "Preferences", icon: Settings },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeSection, setActiveSection] =
    React.useState<SettingsSection>("profile");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-125 md:max-w-175 lg:max-w-220">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>

        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex p-2">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <h1 className="text-lg font-semibold">Account</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your account info.
                  </p>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {NAV.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.key)}
                          isActive={item.key === activeSection}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex h-120 flex-1 flex-col  overflow-hidden px-2 pt-4">
            <div className="flex flex-1 flex-col gap-0 overflow-y-auto p-4 pt-0">
              {activeSection === "profile" && <ProfileDetails />}
              {activeSection === "security" && <Security />}
              {activeSection === "preferences" && <Preferences />}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
