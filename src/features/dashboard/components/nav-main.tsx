"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  FactoryIcon,
  WrenchIcon,
  ClipboardListIcon,
  FileBarChartIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Route } from "next";
import { NavIconKey } from "../data";

const ICONS: Record<NavIconKey, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboardIcon,
  workshops: FactoryIcon,
  equipments: WrenchIcon,
  inspections: ClipboardListIcon,
  reports: FileBarChartIcon,
};

interface NavItem {
  title: string;
  url: string;
  icon: NavIconKey;
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url}
                render={
                  <Link href={item.url as Route}>
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
