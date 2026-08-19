"use client";

import { useEffect } from "react";
import { SquareMousePointer } from "lucide-react";
import { usePathname } from "next/navigation";
import { useHotkey } from "@tanstack/react-hotkeys";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";

import { useDashboardLayoutStore } from "@/features/global/stores/dashboard-layout-store";

export function CustomizeDashboardButton() {
  const pathname = usePathname();

  const isEditMode = useDashboardLayoutStore((state) => state.isEditMode);
  const hasHydrated = useDashboardLayoutStore((state) => state.hasHydrated);
  const toggleEditMode = useDashboardLayoutStore(
    (state) => state.toggleEditMode,
  );
  const setEditMode = useDashboardLayoutStore((state) => state.setEditMode);

  const isDashboardOverview = /^\/dashboard\/cities\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (hasHydrated && !isDashboardOverview && isEditMode) {
      setEditMode(false);
    }
  }, [hasHydrated, isDashboardOverview, isEditMode, setEditMode]);

  function handleCustomize() {
    if (!hasHydrated || !isDashboardOverview) return;

    toggleEditMode();
  }

  useHotkey("C", handleCustomize);

  if (!isDashboardOverview) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={isEditMode ? "secondary" : "outline"}
            size="icon"
            disabled={!hasHydrated}
            onClick={handleCustomize}
            aria-label={
              isEditMode ? "Exit customize mode" : "Customize dashboard"
            }
            className="rounded-full"
          >
            <SquareMousePointer className="size-4" />
          </Button>
        }
      />

      <TooltipContent>
        {isEditMode ? "Exit customize mode" : "Customize dashboard"}{" "}
        <Kbd>C</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
