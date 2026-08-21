"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  LifeBuoy,
  Send,
  ShieldUser,
  ChevronRight,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavFooter from "./nav-footer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

export const nav = {
  navMain: [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },

    {
      title: "User Management",
      icon: MdOutlineAdminPanelSettings,
      items: [
        { title: "Users", url: "/admin/users", icon: Users },
        { title: "Sessions", url: "/admin/sessions", icon: ShieldUser },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {nav.navMain.map((item) => {
              const isActive =
                item.url &&
                ((pathname === "/admin" && item.url === "/admin") ||
                  (item.url !== "/admin" && pathname.includes(item.url)));

              const isGroupActive =
                item.items &&
                item.items.some((sub) => pathname.includes(sub.url));

              if (item.items) {
                return (
                  <Collapsible
                    key={item.title}
                    render={
                      <SidebarMenuItem>
                        {/* Main button
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton> */}

                        {/* Chevron */}
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton tooltip={item.title}>
                              <item.icon />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto group-data-panel-open/menu-button:rotate-90 transition-transform duration-300" />
                            </SidebarMenuButton>
                          }
                        ></CollapsibleTrigger>

                        {/* Sub menu */}
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((sub) => (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  render={
                                    <Link href={sub.url as Route}>
                                      <sub.icon />
                                      <span>{sub.title}</span>
                                    </Link>
                                  }
                                  isActive={pathname === sub.url}
                                ></SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    }
                    defaultOpen={isGroupActive}
                  ></Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.url as Route}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                    tooltip={item.title}
                    isActive={isActive as boolean}
                  ></SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.url as Route}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                    tooltip={item.title}
                  ></SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="hidden sm:flex">
        <SidebarMenu>
          <NavFooter />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
