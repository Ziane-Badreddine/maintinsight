"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Settings, ShieldUser, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { SettingsDialog } from "@/features/auth/components/settings-dialog";
import { Spinner } from "../ui/spinner";
import { useHotkey } from "@tanstack/react-hotkeys";
import Link from "next/link";

export default function UserAvatar() {
  const { data: session, isPending } = authClient.useSession();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [isLoggingOut, startLogoutTransition] = React.useTransition();

  useHotkey("D", () => {
    setTheme(theme === "light" ? "dark" : "light");
  });

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await authClient.signOut();
      router.refresh();
    });
  };

  if (isPending) {
    return (
      <Button variant="outline" size="icon" className="relative rounded-full">
        <Spinner />
      </Button>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full"
            >
              <Avatar>
                <AvatarImage
                  src={session.user.image ?? "/avatar.png"}
                  alt={session.user.name ?? "User"}
                />
                <AvatarFallback className={"bg-foreground"}>
                  <User className="text-primary-foreground size-4.5" />
                </AvatarFallback>
              </Avatar>
            </Button>
          }
        ></DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {session.user.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {session.user.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            {session.user.role === "admin" && (
              <DropdownMenuItem
                render={
                  <Link href={"/admin"}>
                    <ShieldUser className="size-4" />
                    <span>Admin</span>
                  </Link>
                }
              ></DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              closeOnClick={false}
            >
              {isLoggingOut ? (
                <Spinner className="size-4" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
