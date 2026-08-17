"use client";

import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "./logo";

import { AdvisorCenter } from "./advisor-center";
import { RefreshButton } from "./refresh-button";
import { CitySwitcherHeader } from "@/features/city/components/city-switcher";
import { PlantSwitcherHeader } from "./plant-switcher";
import UserAvatar from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { SearchIcon, Slash } from "lucide-react";
import { CreateInspectionButton } from "@/features/inspection/components/create-inspection-button";

export default function Header() {
  const params = useParams<{ cityId?: string; plantId?: string }>();
  const hasCityContext = Boolean(params.cityId);
  const hasPlantContext = Boolean(params.cityId && params.plantId);

  return (
    <header className="flex h-[64.8px] border-b shrink-0 items-center justify-between gap-2 z-10 w-full px-4">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="h-5 md:hidden" />

        <Logo />

        {hasCityContext && (
          <>
            <Slash className="size-4 -rotate-20 text-border" />
            <CitySwitcherHeader cityId={params.cityId!} />
          </>
        )}

        {hasPlantContext && (
          <>
            <Slash className="size-4 -rotate-20 text-border" />
            <PlantSwitcherHeader
              cityId={params.cityId!}
              plantId={params.plantId!}
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <CreateInspectionButton />
        <Button variant="ghost" size="icon-sm" disabled className="opacity-50">
          <SearchIcon className="size-4" />
        </Button>
        <AdvisorCenter
          plantId={params.plantId ? Number(params.plantId) : undefined}
        />
        <RefreshButton />

        <UserAvatar />
      </div>
    </header>
  );
}
