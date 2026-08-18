"use client";

import { useState, useTransition } from "react";
import { Loader2, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";
import {
  inspectionEquipmentSchema,
  type InspectionEquipmentInput,
} from "../../schemas/inspection-equipment.schema";
import { upsertInspectionEquipment } from "../../actions/upsert-inspection-equipment";
import { deleteMeasurement } from "../../actions/delete-measurement";
import { EquipmentStatus } from "../../../../../prisma/generated/prisma/enums";
import type { Measurement } from "../../../../../prisma/generated/prisma/browser";
import type { InspectionEquipmentWithRelations } from "../../types";
import { InspectionListItem } from "../inspection-list-item";
import {
  formatMeasurementValue,
  MEASUREMENT_TYPE_LABEL,
} from "../measurement-labels";
import { InspectionMeasurementsSheet } from "./inspection-measurements-sheet";
import {
  INSPECTION_SHEET_CLASS,
  INSPECTION_SHEET_SCROLL_CLASS,
} from "./inspection-sheet-styles";
import { useQueryClient } from "@tanstack/react-query";

interface InspectionEquipmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: number;
  equipmentId: number;
  equipmentName: string;
  equipmentCode?: string | null;
  entry?: InspectionEquipmentWithRelations;
  defaultValues?: Partial<InspectionEquipmentInput>;
  disabled?: boolean;
  onSaved: () => void;
}

type ActiveMeasurement = Measurement | "new" | null;

export function InspectionEquipmentSheet({
  open,
  onOpenChange,
  inspectionId,
  equipmentId,
  equipmentName,
  equipmentCode,
  entry,
  defaultValues,
  disabled = false,
  onSaved,
}: InspectionEquipmentSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const queryClient = useQueryClient();
  const [activeMeasurement, setActiveMeasurement] =
    useState<ActiveMeasurement>(null);
  const [removeTarget, setRemoveTarget] = useState<Measurement | null>(null);

  const form = useForm<InspectionEquipmentInput>({
    resolver: zodResolver(inspectionEquipmentSchema),
    values: {
      inspectionId,
      equipmentId,
      status: defaultValues?.status ?? entry?.status ?? EquipmentStatus.GOOD,
      diagnosis: defaultValues?.diagnosis ?? entry?.diagnosis ?? "",
      recommendation:
        defaultValues?.recommendation ?? entry?.recommendation ?? "",
      note: defaultValues?.note ?? entry?.note ?? "",
    },
  });

  const measurements = entry?.measurements ?? [];
  const inspectionEquipmentId = entry?.id;
  const canManageMeasurements = Boolean(inspectionEquipmentId) && !disabled;

  function onSubmit(values: InspectionEquipmentInput) {
    startTransition(async () => {
      const result = await upsertInspectionEquipment(values);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not save equipment inspection",
          description: String(result.error),
        });
        return;
      }

      toast.add({ type: "success", title: "Equipment inspection saved" });
      queryClient.invalidateQueries({
        queryKey: ["city-critical-equipments"],
      });
      onSaved();
      onOpenChange(false);
    });
  }

  function openMeasurementSheet(measurement: Measurement | "new") {
    if (!inspectionEquipmentId) {
      toast.add({
        type: "warning",
        title: "Save equipment first",
        description:
          "Save the equipment inspection before adding measurements.",
      });
      return;
    }

    setActiveMeasurement(measurement);
  }

  function handleRemoveMeasurement() {
    if (!removeTarget) return;

    startRemove(async () => {
      const result = await deleteMeasurement(removeTarget.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not remove measurement",
          description: String(result.error),
        });
        return;
      }

      if (
        activeMeasurement !== "new" &&
        activeMeasurement?.id === removeTarget.id
      ) {
        setActiveMeasurement(null);
      }

      toast.add({ type: "success", title: "Measurement removed" });
      setRemoveTarget(null);
      onSaved();
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={INSPECTION_SHEET_CLASS}>
          <SheetHeader>
            <SheetTitle>Equipment inspection</SheetTitle>
            <SheetDescription className="truncate">
              {[equipmentCode, equipmentName].filter(Boolean).join(" · ")}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className={INSPECTION_SHEET_SCROLL_CLASS}>
            <form
              id="inspection-equipment-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6 px-4 pb-4"
            >
              <FieldGroup>
                <Field data-invalid={!!form.formState.errors.status}>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    // eslint-disable-next-line react-hooks/incompatible-library
                    value={form.watch("status")}
                    disabled={disabled}
                    onValueChange={(value) =>
                      form.setValue("status", value as EquipmentStatus)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.status]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="diagnosis">Diagnosis</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id="diagnosis"
                      rows={3}
                      disabled={disabled}
                      placeholder="Observed condition…"
                      {...form.register("diagnosis")}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText>Optional</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Observed condition on site.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="recommendation">
                    Recommendation
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id="recommendation"
                      rows={3}
                      disabled={disabled}
                      placeholder="Recommended action…"
                      {...form.register("recommendation")}
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="note">Note</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id="note"
                      rows={2}
                      disabled={disabled}
                      placeholder="Additional notes…"
                      {...form.register("note")}
                    />
                  </InputGroup>
                </Field>
              </FieldGroup>

              <section className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Measurements</p>
                  <p className="text-sm text-muted-foreground">
                    Select a measurement to edit or add a new one.
                  </p>
                </div>

                <div className="space-y-2">
                  {measurements.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      {inspectionEquipmentId
                        ? "No measurements yet."
                        : "Save equipment details to add measurements."}
                    </div>
                  ) : (
                    measurements.map((measurement) => (
                      <InspectionListItem
                        key={measurement.id}
                        title={`${MEASUREMENT_TYPE_LABEL[measurement.type]} · ${measurement.point}`}
                        subtitle={formatMeasurementValue(
                          measurement.value,
                          measurement.unit,
                        )}
                        disabled={!canManageMeasurements}
                        removeDisabled={!canManageMeasurements || isRemoving}
                        onClick={() => openMeasurementSheet(measurement)}
                        onRemove={
                          canManageMeasurements
                            ? () => setRemoveTarget(measurement)
                            : undefined
                        }
                        meta={
                          <Badge variant="secondary">
                            {MEASUREMENT_TYPE_LABEL[measurement.type]}
                          </Badge>
                        }
                      />
                    ))
                  )}
                </div>

                {canManageMeasurements && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => openMeasurementSheet("new")}
                  >
                    <PlusIcon className="size-4" />
                    Add measurement
                  </Button>
                )}
              </section>
            </form>
          </ScrollArea>

          <SheetFooter className="flex-row gap-2 pb-4">
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="inspection-equipment-form"
                className="flex-1"
                disabled={disabled || isPending}
              >
                {isPending && (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                )}
                Save equipment
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {inspectionEquipmentId && activeMeasurement !== null && (
        <InspectionMeasurementsSheet
          open
          onOpenChange={(open) => {
            if (!open) setActiveMeasurement(null);
          }}
          inspectionEquipmentId={inspectionEquipmentId}
          equipmentName={equipmentName}
          measurement={activeMeasurement === "new" ? null : activeMeasurement}
          disabled={disabled}
          onSaved={onSaved}
        />
      )}

      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this measurement?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `${MEASUREMENT_TYPE_LABEL[removeTarget.type]} · ${removeTarget.point} will be permanently removed.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoving}
              onClick={handleRemoveMeasurement}
            >
              {isRemoving ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
