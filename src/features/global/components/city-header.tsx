"use client";

import Link from "next/link";
import { SearchIcon, Slash } from "lucide-react";
import { Button } from "@/components/ui/button";

import UserAvatar from "@/components/common/user-avatar";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";
import { AdvisorCenter } from "@/features/dashboard/components/advisor-center";
import { CitySwitcherHeader } from "@/features/city/components/city-switcher";
import { Logo } from "@/features/dashboard/components/logo";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface CityHeaderProps {
  cityId: number;
  plants: { id: number; code: string; name: string | null }[];
}

export function CityHeader({ cityId, plants }: CityHeaderProps) {
  const hasCityContext = Boolean(cityId);
  const isMobile = useIsMobile();
  return (
    <>
      <header className="flex h-[64.8px] border-b shrink-0 items-center justify-between gap-2 z-10 w-full px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Logo />

          {hasCityContext && (
            <>
              <Slash className="size-4 -rotate-20 text-border" />
              <CitySwitcherHeader cityId={String(cityId)} />
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled
            className="opacity-50"
          >
            <SearchIcon className="size-4" />
          </Button>
          {/* <AdvisorCenter
            plantId={params.plantId ? Number(params.plantId) : undefined}
          /> */}
          <RefreshButton />

          <UserAvatar />
        </div>
      </header>

      {plants.length > 0 && (
        <Carousel
          opts={{ align: "start", dragFree: isMobile, active: isMobile }}
          className="sticky top-0 z-20 h-12 w-full shrink-0 border-b bg-background"
        >
          <CarouselContent className="ml-0  items-stretch h-12">
            {plants.map((plant) => (
              <CarouselItem
                key={plant.id}
                className="basis-auto pl-0 items-center justify-center"
              >
                <Link
                  href={`/dashboard/cities/${cityId}/plants/${plant.id}`}
                  className="flex items-center px-3.5 font-book relative shrink-0 rounded-xl transition hover:text-primary focus-visible:outline-focus-8 after:bg-primary group font-semibold text-muted-foreground text-sm h-12 "
                >
                  {plant.name ?? plant.code}
                  <div className="bg-primary absolute inset-x-3.5 bottom-0 w-0 h-px group-hover:w-auto"></div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </>
  );
}
