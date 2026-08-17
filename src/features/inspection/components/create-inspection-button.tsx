// features/inspection/components/create-inspection-button.tsx

"use client";

import { useState, useTransition } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getOrCreateTodayDraftInspection } from "../actions/get-or-create-today-draft";

import { InspectionWithRelations } from "../types";

import { InspectionHeaderSheet } from "./sheets/inspection-header-sheet";
import { GrInspect } from "react-icons/gr";

export function CreateInspectionButton() {
  const [open, setOpen] = useState(false);

  const [inspection, setInspection] = useState<InspectionWithRelations | null>(
    null,
  );

  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    startTransition(async () => {
      const result = await getOrCreateTodayDraftInspection();

      if (result.success) {
        setInspection(result.inspection);

        setOpen(true);
      }

      // TODO: toast on error
    });
  }

  return (
    <>
      <Button onClick={handleOpen} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GrInspect className="size-4" />
        )}
        Inspect
      </Button>

      <InspectionHeaderSheet
        open={open}
        onOpenChange={setOpen}
        inspection={inspection}
        onInspectionChange={setInspection}
      />
    </>
  );
}
