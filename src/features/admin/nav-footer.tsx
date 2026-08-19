"use client";
import Link from "next/link";

import { SidebarIcon } from "lucide-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export default function NavFooter() {
  const { toggleSidebar } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <Link href={"#"} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarIcon className="size-4" />
              Collapsed
            </div>
            <KbdGroup>
              <Kbd>Ctrl / ⌘</Kbd>
              <Kbd>B</Kbd>
            </KbdGroup>
          </Link>
        }
        onClick={toggleSidebar}
        tooltip={"Expanded"}
      ></SidebarMenuButton>
    </SidebarMenuItem>
  );
}
