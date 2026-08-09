"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookLock,
  Laptop,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export default function UserAvatar() {
  const { data: session, isPending } = authClient.useSession();
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  if (isPending) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Avatar>
              <AvatarImage
                src={session.user.image ?? "/avatar.png"}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback>
                {session.user.name?.charAt(0).toUpperCase() ?? "U"}
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

          <DropdownMenuItem
            render={
              <Link href={"/settings/profile" as Route}>
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            }
          ></DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Moon className="size-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="size-4" />
                <span>Light</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="size-4" />
                <span>Dark</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="size-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            render={
              <Link href={"/privacy-policy" as Route}>
                <BookLock className="size-4" />
                <span>Privacy Policy</span>
              </Link>
            }
          ></DropdownMenuItem>

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
