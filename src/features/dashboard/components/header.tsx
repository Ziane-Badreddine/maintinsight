// features/dashboard/components/header.tsx
import { Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/common/user-avatar";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";
import Logo from "@/assets/logo.svg";
import { EditModeToolbar } from "@/features/global/components/edit-mode-toolbar";
import { CityAdvisorCenter } from "./advisor-center";
import FullscreenButton from "./fullscreen-button";
import { CustomizeDashboardButton } from "./customize-dashboard-button";

import NavSlot from "./nav-slot";
import CitySwitcherSlot from "./city-switcher-slot";
import CreateInspectionSlot from "./create-inspection-slot";

import GenerateReportSheetServer from "@/features/report/components/generate-report-sheet-server";
import Link from "next/link";

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
          <Link
            href="/dashboard"
            className="flex items-center gap-2 shrink-0 mr-2"
          >
            <Logo className="size-6" title="maintinsight" />
          </Link>

          <Suspense
            fallback={<Skeleton className="h-6 w-32 rounded-full ml-2" />}
          >
            <CitySwitcherSlot paramsPromise={paramsPromise} />
          </Suspense>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5",
              // --- mobile : nav flottante ---
              "border bg-linear-to-b from-background/95 via-background/80 to-card ",
              "fixed bottom-4 left-1/2 z-30 -translate-x-1/2",
              "max-w-[calc(100vw-2rem)] overflow-x-auto",
              "scroll-fade-x no-scrollbar",
              "rounded-full border bg-background/95 backdrop-blur",
              "supports-backdrop-filter:bg-background/80",
              "px-6 py-3 shadow-lg outline-4 outline-input/30",
              // --- reset à partir de md: pour revenir dans le flux du header ---
              "md:static md:left-auto md:bottom-auto md:z-auto md:translate-x-0",
              "md:max-w-none md:overflow-visible md:scroll-fade-none",
              "md:rounded-none md:border-0 md:bg-transparent md:backdrop-blur-none",
              "md:px-0 md:py-0 md:shadow-none md:gap-2 md:outline-none md:bg-none",
            )}
          >
            <Suspense
              fallback={
                <Skeleton className="size-8 md:h-6 md:w-32 rounded-full ml-2" />
              }
            >
              <CreateInspectionSlot />
            </Suspense>
            <Suspense
              fallback={
                <Skeleton className="size-8 md:h-6 md:w-32 rounded-full ml-2" />
              }
            >
              <GenerateReportSheetServer paramsPromise={paramsPromise} />
            </Suspense>

            <Button
              variant="outline"
              size="icon"
              disabled
              className="hidden md:inline-flex shrink-0 opacity-50 rounded-full"
            >
              <SearchIcon className="size-4" />
            </Button>
            <CustomizeDashboardButton />
            <FullscreenButton />
            <CityAdvisorCenter />
            <RefreshButton />
          </div>

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
