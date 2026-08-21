"use client";

import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Route } from "next";
import UserAvatar from "@/components/common/user-avatar";
import { Logo } from "../dashboard/components/logo";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  items: "Items",
  dashboard: "Dashboard",
  collection: "Collection",
  listings: "Listings",
  transactions: "Transactions",
  upload: "Upload",
  billing: "Billing",
  checkout: "Checkout",
  success: "Success",
  cancel: "Cancel",
  explore: "Explore",
  artists: "Artists",
  settings: "Settings",
  profile: "Profile",
  security: "Security",
};

function getLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

interface Crumb {
  label: string;
  href: string;
}

function useBreadcrumbs(): Crumb[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    label: getLabel(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));
}

export function SiteHeader() {
  const crumbs = useBreadcrumbs();
  const lastCrumb = crumbs[crumbs.length - 1];

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b h-[64.8px]">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        {/* Left — logo + separator + breadcrumb */}
        <div className="flex items-center gap-2 md:gap-4">
          <Logo />

          <Slash className="-rotate-25 size-4 text-muted-foreground" />

          {/* Mobile — last segment only */}
          {lastCrumb && (
            <span className="text-sm font-medium sm:hidden">
              {lastCrumb.label}
            </span>
          )}

          {/* Desktop — full breadcrumb */}
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {crumbs
                .map((crumb, index) => {
                  const isLast = index === crumbs.length - 1;
                  return (
                    <BreadcrumbItem key={crumb.href}>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={
                            <Link href={crumb.href as Route}>
                              {crumb.label}
                            </Link>
                          }
                        ></BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  );
                })
                .reduce<React.ReactNode[]>((acc, item, index) => {
                  if (index === 0) return [item];
                  return [
                    ...acc,
                    <BreadcrumbSeparator key={`sep-${index}`}>
                      <Slash className="-rotate-25" />
                    </BreadcrumbSeparator>,
                    item,
                  ];
                }, [])}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <UserAvatar />
          <SidebarTrigger variant="outline" className="sm:hidden " />
        </div>
      </div>
    </header>
  );
}
