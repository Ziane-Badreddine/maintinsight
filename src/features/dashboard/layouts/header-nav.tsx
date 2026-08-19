"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: Route;
  exact?: boolean;
}

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function HeaderNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (nav.length === 0) return null;

  return (
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
  );
}
