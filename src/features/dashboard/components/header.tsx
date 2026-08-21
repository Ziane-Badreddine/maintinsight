"use client";

import Link from "next/link";
import { SearchIcon, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import UserAvatar from "@/components/common/user-avatar";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";
import { CitySwitcherHeader } from "@/features/city/components/city-switcher";
import { Logo } from "@/features/dashboard/components/logo";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

import { CreateInspectionButton } from "@/features/inspection/components/create-inspection-button";

import { useParams, usePathname } from "next/navigation";
import { EditModeToolbar } from "@/features/global/components/edit-mode-toolbar";
import { Route } from "next";
import { cn } from "@/lib/utils";
import { CityAdvisorCenter } from "./advisor-center";
import FullscreenButton from "./fullscreen-button";
import { CustomizeDashboardButton } from "./customize-dashboard-button";
import { authClient } from "@/lib/auth-client";

export type CheckRolePermissionArgs = Parameters<
  typeof authClient.admin.checkRolePermission
>[0];
export type Role = CheckRolePermissionArgs["role"];
export type Permissions = CheckRolePermissionArgs["permissions"];

interface NavItem {
  label: string;
  href: Route;
  exact?: boolean;
  permission?: Permissions;
}

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const NAV_SKELETON_WIDTHS = ["w-16", "w-12", "w-20", "w-24", "w-20", "w-16"];

export default function Header() {
  const params = useParams<{ cityId: string }>();
  const pathname = usePathname();
  const hasCityContext = Boolean(params.cityId);

  const isMobile = useIsMobile();

  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const roles = (session?.user?.role?.split(",") ?? []) as Role[];

  function hasPermission(permissions?: Permissions) {
    if (!permissions) return true;
    if (isSessionPending) return false;

    return roles.some((role) =>
      authClient.admin.checkRolePermission({
        role,
        permissions,
      }),
    );
  }

  const nav: NavItem[] = isSessionPending
    ? []
    : [
        {
          label: "Overview",
          href: `/dashboard/cities/${params.cityId}` as Route,
          exact: true,
          permission: { dashboard: ["read"] } satisfies Permissions,
        },
        {
          label: "Plants",
          href: `/dashboard/cities/${params.cityId}/plants` as Route,
          permission: { plant: ["read"] } satisfies Permissions,
        },
        {
          label: "Workshops",
          href: `/dashboard/cities/${params.cityId}/workshops` as Route,
          permission: { workshop: ["read"] } satisfies Permissions,
        },
        {
          label: "Equipments",
          href: `/dashboard/cities/${params.cityId}/equipments` as Route,
          permission: { equipment: ["read"] } satisfies Permissions,
        },
        {
          label: "Inspections",
          href: `/dashboard/cities/${params.cityId}/inspections` as Route,
          permission: { inspection: ["read"] } satisfies Permissions,
        },
        {
          label: "Reports",
          href: `/dashboard/cities/${params.cityId}/reports` as Route,
          permission: { report: ["read"] } satisfies Permissions,
        },
      ].filter((item) => hasPermission(item.permission));

  const canCreateInspection = hasPermission({
    inspection: ["create"],
  } satisfies Permissions);

  return (
    <>
      <header className="flex h-[64.8px] border-b shrink-0 items-center justify-between gap-2 z-10 w-full px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Logo />

          {hasCityContext && (
            <>
              <Slash className="size-4 -rotate-20 text-border" />
              <CitySwitcherHeader cityId={params.cityId!} />
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
            <SearchIcon className="size-4" />
          </Button>

          <CustomizeDashboardButton />

          <FullscreenButton />

          <CityAdvisorCenter cityId={Number(params.cityId)} />
          <RefreshButton />

          <UserAvatar />
        </div>
      </header>

      {isSessionPending ? (
        <div className="sticky top-0 z-20 flex h-12 w-full shrink-0 items-center gap-2 border-b bg-background px-3.5">
          {NAV_SKELETON_WIDTHS.map((width, index) => (
            <Skeleton key={index} className={cn("h-4 rounded-full", width)} />
          ))}
        </div>
      ) : (
        nav.length > 0 && (
          <Carousel
            opts={{ align: "start", dragFree: isMobile, active: isMobile }}
            className="sticky top-0 z-20 h-12 w-full shrink-0 border-b bg-background"
          >
            <CarouselContent className="ml-0  items-stretch h-12">
              {nav.map((item) => {
                const active = isNavItemActive(pathname, item);
                return (
                  <CarouselItem
                    key={item.label}
                    className="basis-auto pl-0 items-center justify-center"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3.5 font-book relative shrink-0 rounded-xl transition hover:text-primary focus-visible:outline-focus-8 after:bg-primary group font-semibold text-muted-foreground text-sm h-12 ",
                        active && "text-primary",
                      )}
                    >
                      {item.label}
                      <div
                        className={cn(
                          "bg-primary absolute inset-x-3.5 bottom-0 w-0 h-px group-hover:w-auto",
                          active && "w-auto",
                        )}
                      ></div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        )
      )}

      <EditModeToolbar />
    </>
  );
}
