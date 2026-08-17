"use client";

import { Check, GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardLayoutStore } from "@/features/global/stores/dashboard-layout-store";
import { cn } from "@/lib/utils";

export function EditModeToolbar() {
  const isEditMode = useDashboardLayoutStore((s) => s.isEditMode);
  const toggleEditMode = useDashboardLayoutStore((s) => s.toggleEditMode);
  const resetLayout = useDashboardLayoutStore((s) => s.resetLayout);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-200",
        isEditMode
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 rounded-full border bg-linear-to-b from-background/95 via-background/80 to-card px-6 py-3 shadow-lg backdrop-blur outline-4 outline-input/30 ">
        <div className="flex items-center gap-1.5 pl-1 pr-2 text-xs font-medium text-muted-foreground">
          <GripVertical className="size-3.5" />
          Customizing dashboard
        </div>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={resetLayout}
          className="text-muted-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>

        <Button size="sm" onClick={toggleEditMode}>
          <Check className="size-3.5" />
          Done
        </Button>
      </div>
    </div>
  );
}
