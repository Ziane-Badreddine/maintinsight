// features/dashboard/components/header.tsx
import { Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/common/user-avatar";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";
import { Logo } from "@/features/dashboard/components/logo";
import { EditModeToolbar } from "@/features/global/components/edit-mode-toolbar";
import { CityAdvisorCenter } from "./advisor-center";
import FullscreenButton from "./fullscreen-button";
import { CustomizeDashboardButton } from "./customize-dashboard-button";

import NavSlot from "./nav-slot";
import CitySwitcherSlot from "./city-switcher-slot";
import CreateInspectionSlot from "./create-inspection-slot";

const NAV_SKELETON_WIDTHS = ["w-16", "w-12", "w-20", "w-24", "w-20", "w-16"];

export default function Header({
  paramsPromise,
}: {
  paramsPromise: Promise<{ cityId: string }>;
}) {
  return (
    <>
      <header className="flex h-[64.8px] border-b shrink-0 items-center justify-between gap-2 z-10 w-full px-4">
        <div className="flex items-center gap-2 min-w-0">
          {/* Logo : statique, pas de Suspense */}
          <Logo />

          <Suspense
            fallback={<Skeleton className="h-6 w-32 rounded-full ml-2" />}
          >
            <CitySwitcherSlot paramsPromise={paramsPromise} />
          </Suspense>
        </div>

        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <CreateInspectionSlot />
          </Suspense>

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
          <CityAdvisorCenter />
          <RefreshButton />
          <UserAvatar />
        </div>
      </header>

      <Suspense
        fallback={
          <div className="sticky top-0 z-20 flex h-12 w-full items-center gap-2 border-b bg-background px-3.5">
            {NAV_SKELETON_WIDTHS.map((w, i) => (
              <Skeleton key={i} className={cn("h-4 rounded-full", w)} />
            ))}
          </div>
        }
      >
        <NavSlot paramsPromise={paramsPromise} />
      </Suspense>

      <EditModeToolbar />
    </>
  );
}
