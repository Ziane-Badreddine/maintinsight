// features/inspection/components/create-inspection-button.tsx

"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { GrVmMaintenance } from "react-icons/gr";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";

import { useHotkey } from "@tanstack/react-hotkeys";

import { getOrCreateTodayDraftInspection } from "../actions/get-or-create-today-draft";
import { InspectionWithRelations } from "../types";
import { InspectionHeaderSheet } from "./sheets/inspection-header-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function CreateInspectionButton() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const [inspection, setInspection] = useState<InspectionWithRelations | null>(
    null,
  );

  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    if (isPending) return;

    startTransition(async () => {
      const result = await getOrCreateTodayDraftInspection();

      if (result.success) {
        setInspection(result.inspection);
        setOpen(true);
      }

      // TODO: toast on error
    });
  }

  useHotkey("I", handleOpen);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={handleOpen}
              size={isMobile ? "icon" : "default"}
              disabled={isPending}
              aria-label="Create inspection"
              className={cn(isMobile && "rounded-full")}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GrVmMaintenance className="size-4" />
              )}
              <span className="hidden md:block">Inspect</span>
            </Button>
          }
        />
        <TooltipContent>
          Inspect <Kbd>I</Kbd>
        </TooltipContent>
      </Tooltip>

      <InspectionHeaderSheet
        open={open}
        onOpenChange={setOpen}
        inspection={inspection}
        onInspectionChange={setInspection}
      />
    </>
  );
}
