"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";
import { revertInspectionToDraft } from "../../actions/revert-inspection-to-draft";
import type { InspectionWithRelations } from "../../types";
import {
  formatMeasurementValue,
  MEASUREMENT_TYPE_LABEL,
} from "../measurement-labels";
import { inspectionDetailQueryOptions } from "../../utils/inspection-query";
import {
  INSPECTION_SHEET_CLASS,
  INSPECTION_SHEET_SCROLL_CLASS,
} from "./inspection-sheet-styles";

interface InspectionReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: number;
  onProceedToValidate: (inspection: InspectionWithRelations) => void;
  onRevertedToDraft: (inspection: InspectionWithRelations) => void;
}

export function InspectionReviewSheet({
  open,
  onOpenChange,
  inspectionId,
  onProceedToValidate,
  onRevertedToDraft,
}: InspectionReviewSheetProps) {
  const queryClient = useQueryClient();
  const [revertOpen, setRevertOpen] = useState(false);
  const [isReverting, startRevert] = useTransition();
  const {
    data: inspection,
    isLoading,
    isError,
  } = useQuery({
    ...inspectionDetailQueryOptions(inspectionId),
    enabled: open,
  });

  const equipmentCount = inspection?.equipments.length ?? 0;
  const measurementCount =
    inspection?.equipments.reduce(
      (total, item) => total + item.measurements.length,
      0,
    ) ?? 0;

  function handleRevertToDraft() {
    startRevert(async () => {
      const result = await revertInspectionToDraft(inspectionId);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not revert inspection",
          description: String(result.error),
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Inspection reverted to draft",
        description: "The inspector can edit and resubmit it.",
      });
      await queryClient.invalidateQueries({
        queryKey: ["inspection", inspectionId],
      });
      setRevertOpen(false);
      onOpenChange(false);
      onRevertedToDraft(result.inspection);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={INSPECTION_SHEET_CLASS}>
        <SheetHeader>
          <SheetTitle>Review inspection</SheetTitle>
          <SheetDescription>
            Review all details before validating this inspection.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className={INSPECTION_SHEET_SCROLL_CLASS}>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading inspection details…
              </div>
            ) : isError || !inspection ? (
              <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Could not load inspection details.
              </div>
            ) : (
              <>
                <section className="space-y-3 rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Completed</Badge>
                    <Badge variant="outline">{equipmentCount} equipment</Badge>
                    <Badge variant="outline">
                      {measurementCount} measurement
                      {measurementCount === 1 ? "" : "s"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Inspection date</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="size-4 shrink-0" />
                      {format(new Date(inspection.inspectionDate), "PPP")}
                    </div>
                  </div>

                  {inspection.comment ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Comment</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {inspection.comment}
                      </p>
                    </div>
                  ) : null}
                </section>

                <section className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Inspected equipment</p>
                    <p className="text-sm text-muted-foreground">
                      Status, notes, and measurements for each item.
                    </p>
                  </div>

                  {inspection.equipments.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      No equipment recorded on this inspection.
                    </div>
                  ) : (
                    inspection.equipments.map((item, index) => {
                      const statusConfig = STATUS_CONFIG[item.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div key={item.id} className="space-y-3">
                          {index > 0 ? <Separator /> : null}
                          <div
                            className={`space-y-3 rounded-lg border p-4 ${statusConfig.badgeClass}`}
                          >
                            <div className="space-y-1">
                              <p className="font-medium">
                                {item.equipment.name}
                              </p>
                              {item.equipment.code ? (
                                <p className="text-sm opacity-80">
                                  {item.equipment.code}
                                </p>
                              ) : null}
                              <Badge
                                variant="outline"
                                className="gap-1 bg-background/60"
                              >
                                <StatusIcon className="size-3.5" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {item.diagnosis ? (
                              <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                                  Diagnosis
                                </p>
                                <p className="text-sm whitespace-pre-wrap">
                                  {item.diagnosis}
                                </p>
                              </div>
                            ) : null}

                            {item.recommendation ? (
                              <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                                  Recommendation
                                </p>
                                <p className="text-sm whitespace-pre-wrap">
                                  {item.recommendation}
                                </p>
                              </div>
                            ) : null}

                            {item.note ? (
                              <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                                  Note
                                </p>
                                <p className="text-sm whitespace-pre-wrap">
                                  {item.note}
                                </p>
                              </div>
                            ) : null}

                            <div className="space-y-2">
                              <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                                Measurements
                              </p>
                              {item.measurements.length === 0 ? (
                                <p className="text-sm opacity-80">
                                  No measurements recorded.
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {item.measurements.map((measurement) => (
                                    <li
                                      key={measurement.id}
                                      className="rounded-md border bg-background/60 px-3 py-2 text-sm"
                                    >
                                      <p className="font-medium">
                                        {
                                          MEASUREMENT_TYPE_LABEL[
                                            measurement.type
                                          ]
                                        }{" "}
                                        · {measurement.point}
                                      </p>
                                      <p className="text-muted-foreground">
                                        {formatMeasurementValue(
                                          measurement.value,
                                          measurement.unit,
                                        )}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 pb-4">
          <Button
            type="button"
            variant="outline"
            className="mr-auto"
            disabled={isLoading || isError || !inspection || isReverting}
            onClick={() => setRevertOpen(true)}
          >
            Revert to draft
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoading || isError || !inspection || isReverting}
              onClick={() => {
                if (inspection) {
                  onProceedToValidate(inspection);
                }
              }}
            >
              Proceed to validate
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>

      <AlertDialog open={revertOpen} onOpenChange={setRevertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This inspection will return to draft status so the inspector can
              make changes and submit it again. Use this if corrections are
              needed before validation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReverting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isReverting}
              onClick={handleRevertToDraft}
            >
              {isReverting ? "Reverting…" : "Revert to draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
