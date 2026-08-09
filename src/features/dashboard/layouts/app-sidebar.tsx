import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "../components/nav-main";
import { getNavItems } from "../data";
import { SidebarCollapseToggle } from "../components/sidebar-collapse-toggle";

interface AppSidebarProps {
  plantId: string;
  cityId: string;
}

export function AppSidebar({ plantId, cityId }: AppSidebarProps) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-t"
      collapsible="icon"
    >
      <SidebarContent>
        <NavMain items={getNavItems(cityId, plantId)} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarCollapseToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
