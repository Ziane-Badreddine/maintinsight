// features/dashboard/components/header-actions.tsx
"use client";

import { usePathname } from "next/navigation";
import { Download, SearchIcon, SquareMousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/common/user-avatar";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";
import { CreateInspectionButton } from "@/features/inspection/components/create-inspection-button";
import { useDashboardLayoutStore } from "@/features/global/stores/dashboard-layout-store";
import { EditModeToolbar } from "@/features/global/components/edit-mode-toolbar";
import { CityAdvisorCenter } from "../components/advisor-center";

export function HeaderActions() {
  const pathname = usePathname();

  const isEditMode = useDashboardLayoutStore((s) => s.isEditMode);
  const hasHydrated = useDashboardLayoutStore((s) => s.hasHydrated);
  const toggleEditMode = useDashboardLayoutStore((s) => s.toggleEditMode);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button disabled>
          <Download />
          Export{" "}
        </Button>
        <CreateInspectionButton />
        <Button
          variant="outline"
          size="icon"
          disabled
          className="opacity-50 rounded-full"
        >
          <SearchIcon className="size-4" />
        </Button>

        {/^\/dashboard\/cities\/[^/]+$/.test(pathname) && (
          <Button
            variant={hasHydrated && isEditMode ? "secondary" : "outline"}
            size="icon"
            disabled={!hasHydrated || isEditMode}
            onClick={toggleEditMode}
            title="Customize dashboard"
            className={"rounded-full"}
          >
            <SquareMousePointer className="size-4" />
          </Button>
        )}

        <CityAdvisorCenter />
        <RefreshButton />

        <UserAvatar />
      </div>

      <EditModeToolbar />
    </>
  );
}
