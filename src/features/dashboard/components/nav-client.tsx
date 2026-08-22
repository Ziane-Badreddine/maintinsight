// features/dashboard/components/nav-client.tsx
"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  label: string;
  href: Route;
  exact?: boolean;
}

function isNavItemActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function NavClient({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (nav.length === 0) {
    return (
      <div className="sticky top-0 z-20 flex h-12 w-full items-center gap-2 border-b bg-background px-3.5">
        {["w-16", "w-12", "w-20", "w-24", "w-20", "w-16"].map((w, i) => (
          <Skeleton key={i} className={cn("h-4 rounded-full", w)} />
        ))}
      </div>
    );
  }

  return (
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
  );
}
