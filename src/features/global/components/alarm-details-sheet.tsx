"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";

import type { AlarmOverviewRow } from "../server/city-alarms-overview";
import {
  formatMeasurementValue,
  MEASUREMENT_TYPE_LABEL,
} from "@/features/inspection/components/measurement-labels";
import { cn } from "@/lib/utils";
import { INSPECTION_SHEET_CLASS } from "@/features/inspection/components/sheets/inspection-sheet-styles";

interface AlarmDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alarm: AlarmOverviewRow | null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export function AlarmDetailsSheet({
  open,
  onOpenChange,
  alarm,
}: AlarmDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("flex flex-col ", INSPECTION_SHEET_CLASS)}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {alarm?.equipmentName ?? "Alarm details"}
            {alarm && (
              <Badge variant="destructive">
                {STATUS_CONFIG[alarm.status]?.label ?? alarm.status}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="truncate">
            {alarm
              ? [
                  alarm.equipmentCode,
                  alarm.workshopName,
                  alarm.plantName ?? alarm.plantCode,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : null}
          </SheetDescription>
        </SheetHeader>

        {alarm && (
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-6 px-4 pb-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Inspection</FieldLabel>
                  <FieldDescription>
                    {DATE_FORMATTER.format(alarm.inspectionDate)}
                    {alarm.inspectionReference
                      ? ` · ${alarm.inspectionReference}`
                      : ""}
                    {alarm.performedByName
                      ? ` · by ${alarm.performedByName}`
                      : ""}
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Diagnosis</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    {alarm.diagnosis || "No diagnosis recorded."}
                  </p>
                </Field>

                <Field>
                  <FieldLabel>Recommendation</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    {alarm.recommendation || "No recommendation recorded."}
                  </p>
                </Field>

                {alarm.note && (
                  <Field>
                    <FieldLabel>Note</FieldLabel>
                    <p className="text-sm text-muted-foreground">
                      {alarm.note}
                    </p>
                  </Field>
                )}
              </FieldGroup>

              <section className="space-y-3">
                <p className="text-sm font-medium">Measurements</p>

                {alarm.measurements.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No measurements recorded.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alarm.measurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {MEASUREMENT_TYPE_LABEL[
                              measurement.type as keyof typeof MEASUREMENT_TYPE_LABEL
                            ] ?? measurement.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {measurement.point}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {formatMeasurementValue(
                            measurement.value,
                            measurement.unit,
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        )}

        <SheetFooter className="pb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
