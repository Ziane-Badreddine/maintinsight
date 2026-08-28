"use client";

import Link from "next/link";
import type { Route } from "next";
import { SearchIcon, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/common/user-avatar";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";
import { CitySwitcherHeader } from "@/features/city/components/city-switcher";
import Logo from "@/assets/logo.svg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateInspectionButton } from "@/features/inspection/components/create-inspection-button";
import { useParams, usePathname } from "next/navigation";
import { EditModeToolbar } from "@/features/global/components/edit-mode-toolbar";
import { cn } from "@/lib/utils";
import { CityAdvisorCenter } from "./advisor-center";
import FullscreenButton from "./fullscreen-button";
import { CustomizeDashboardButton } from "./customize-dashboard-button";
import type { City } from "../../../../prisma/generated/prisma/client";

export type HeaderSession = { role?: string | null } | null;
export type Permissions = Record<string, string[] | undefined>;

interface NavItem {
  label: string;
  href: Route;
  exact?: boolean;
  permission?: Permissions;
}
interface HeaderClientProps {
  cities: City[];
  session: HeaderSession;
}

function isNavItemActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const NAV_SKELETON_WIDTHS = ["w-16", "w-12", "w-20", "w-24", "w-20", "w-16"];
const rolePermissions: Record<string, Permissions> = {
  admin: {
    dashboard: ["read"],
    plant: ["read"],
    workshop: ["read"],
    equipment: ["read"],
    inspection: ["read", "create"],
    report: ["read"],
  },
  manager: {
    dashboard: ["read"],
    equipment: ["read"],
    inspection: ["read", "validate"],
    report: ["read", "generate", "download"],
  },
  inspector: {
    dashboard: ["read"],
    equipment: ["read"],
    inspection: ["create", "read", "update"],
    report: ["read"],
  },
  viewer: {
    dashboard: ["read"],
    plant: ["read"],
    workshop: ["read"],
    equipment: ["read"],
  },
};

function hasPermission(session: HeaderSession, permission?: Permissions) {
  if (!permission) return true;
  const roles = session?.role?.split(",") ?? [];
  return roles.some((role) =>
    Object.entries(permission).every(([resource, actions]) =>
      (actions ?? []).every((action) =>
        rolePermissions[role]?.[resource]?.includes(action),
      ),
    ),
  );
}

export default function HeaderClient({ cities, session }: HeaderClientProps) {
  const params = useParams<{ cityId: string }>();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const cityId = params.cityId;
  const nav: NavItem[] = [
    {
      label: "Overview",
      href: `/dashboard/cities/${cityId}` as Route,
      exact: true,
      permission: { dashboard: ["read"] },
    },
    {
      label: "Plants",
      href: `/dashboard/cities/${cityId}/plants` as Route,
      permission: { plant: ["read"] },
    },
    {
      label: "Workshops",
      href: `/dashboard/cities/${cityId}/workshops` as Route,
      permission: { workshop: ["read"] },
    },
    {
      label: "Equipments",
      href: `/dashboard/cities/${cityId}/equipments` as Route,
      permission: { equipment: ["read"] },
    },
    {
      label: "Inspections",
      href: `/dashboard/cities/${cityId}/inspections` as Route,
      permission: { inspection: ["read"] },
    },
    {
      label: "Reports",
      href: `/dashboard/cities/${cityId}/reports` as Route,
      permission: { report: ["read"] },
    },
  ].filter((item) => hasPermission(session, item.permission));
  const canCreateInspection = hasPermission(session, {
    inspection: ["create"],
  });

  return (
    <>
      <header className="flex h-[64.8px] border-b shrink-0 items-center justify-between gap-2 z-10 w-full px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 shrink-0 mr-2"
          >
            <Logo className="size-6" title="maintinsight" />
          </Link>
          {cityId && (
            <>
              <Slash className="size-4 -rotate-20 text-border" />
              <CitySwitcherHeader cityId={cityId} cities={cities} />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canCreateInspection && <CreateInspectionButton />}
          <Button
            variant="outline"
            size="icon"
            disabled
            className="opacity-50 rounded-full"
          >
            <SearchIcon />
          </Button>
          <CustomizeDashboardButton />
          <FullscreenButton />
          <CityAdvisorCenter />
          <RefreshButton />
          <UserAvatar />
        </div>
      </header>
      {nav.length > 0 ? (
        <Carousel
          opts={{ align: "start", dragFree: isMobile, active: isMobile }}
          className="sticky top-0 z-20 h-12 w-full shrink-0 border-b bg-background"
        >
          <CarouselContent className="ml-0 items-stretch h-12">
            {nav.map((item) => (
              <CarouselItem
                key={item.label}
                className="basis-auto pl-0 items-center justify-center"
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3.5 font-book relative shrink-0 rounded-xl transition hover:text-primary focus-visible:outline-focus-8 group font-semibold text-muted-foreground text-sm h-12",
                    isNavItemActive(pathname, item) && "text-primary",
                  )}
                >
                  {item.label}
                  <div
                    className={cn(
                      "bg-primary absolute inset-x-3.5 bottom-0 w-0 h-px group-hover:w-auto",
                      isNavItemActive(pathname, item) && "w-auto",
                    )}
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="sticky top-0 z-20 flex h-12 w-full items-center gap-2 border-b bg-background px-3.5">
          {NAV_SKELETON_WIDTHS.map((width, index) => (
            <Skeleton key={index} className={cn("h-4 rounded-full", width)} />
          ))}
        </div>
      )}
      <EditModeToolbar />
    </>
  );
}
