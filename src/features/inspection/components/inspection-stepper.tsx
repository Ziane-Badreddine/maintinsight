"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";
import { deleteInspectionEquipment } from "../actions/delete-inspection-equipment";
import { getInspection } from "../actions/get-inspection";
import type { EquipmentSearchOption } from "../actions/search-equipment";
import type {
  InspectionEquipmentWithRelations,
  InspectionWithRelations,
} from "../types";
import { EquipmentPickerCombobox } from "./equipment-picker-combobox";
import { InspectionListItem } from "./inspection-list-item";
import { InspectionEquipmentSheet } from "./sheets/inspection-equipment-sheet";

interface InspectionStepperProps {
  inspection: InspectionWithRelations;
  onInspectionChange: (inspection: InspectionWithRelations) => void;
}

type ActiveEquipment = {
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string | null;
  entry?: InspectionEquipmentWithRelations;
} | null;

export function InspectionStepper({
  inspection,
  onInspectionChange,
}: InspectionStepperProps) {
  const [activeEquipment, setActiveEquipment] = useState<ActiveEquipment>(null);
  const [removeTarget, setRemoveTarget] =
    useState<InspectionEquipmentWithRelations | null>(null);
  const [isRefreshing, startRefresh] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  const isLocked = inspection.status !== "DRAFT";
  const excludeEquipmentIds = inspection.equipments.map(
    (item) => item.equipmentId,
  );

  function refreshInspection() {
    startRefresh(async () => {
      const result = await getInspection(inspection.id);
      if (result.success) {
        onInspectionChange(result.inspection);
      }
    });
  }

  function openEquipmentSheet(
    equipmentId: number,
    equipmentName: string,
    equipmentCode: string | null,
    entry?: InspectionEquipmentWithRelations,
  ) {
    setActiveEquipment({ equipmentId, equipmentName, equipmentCode, entry });
  }

  function handleEquipmentSelected(equipment: EquipmentSearchOption) {
    openEquipmentSheet(equipment.id, equipment.name, equipment.code);
  }

  function handleRemoveEquipment() {
    if (!removeTarget) return;

    startRemove(async () => {
      const result = await deleteInspectionEquipment(removeTarget.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Could not remove equipment",
          description: String(result.error),
        });
        return;
      }

      if (activeEquipment?.equipmentId === removeTarget.equipmentId) {
        setActiveEquipment(null);
      }

      toast.add({ type: "success", title: "Equipment removed" });
      setRemoveTarget(null);
      refreshInspection();
    });
  }

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Inspected equipment</p>
            <p className="text-sm text-muted-foreground">
              Select equipment to update its inspection details.
            </p>
          </div>
          {isRefreshing && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {!isLocked && (
          <EquipmentPickerCombobox
            excludeIds={excludeEquipmentIds}
            onSelect={handleEquipmentSelected}
          />
        )}

        <div className="space-y-2">
          {inspection.equipments.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No equipment added yet. Use the search above to add one.
            </div>
          ) : (
            inspection.equipments.map((item) => {
              const statusConfig = STATUS_CONFIG[item.status];
              const StatusIcon = statusConfig.icon;

              return (
                <InspectionListItem
                  key={item.id}
                  title={item.equipment.name}
                  subtitle={item.equipment.code}
                  disabled={isLocked}
                  removeDisabled={isLocked || isRemoving}
                  statusClassName={statusConfig.badgeClass}
                  onClick={() =>
                    openEquipmentSheet(
                      item.equipmentId,
                      item.equipment.name,
                      item.equipment.code,
                      item,
                    )
                  }
                  onRemove={isLocked ? undefined : () => setRemoveTarget(item)}
                  meta={
                    <>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 bg-background/60",
                          statusConfig.badgeClass,
                        )}
                      >
                        <StatusIcon className="size-3.5" />
                        {statusConfig.label}
                      </Badge>
                      <Badge variant="secondary" className="bg-background/60">
                        {item.measurements.length} measurement
                        {item.measurements.length === 1 ? "" : "s"}
                      </Badge>
                    </>
                  }
                />
              );
            })
          )}
        </div>
      </section>

      {activeEquipment && (
        <InspectionEquipmentSheet
          open
          onOpenChange={(open) => {
            if (!open) setActiveEquipment(null);
          }}
          inspectionId={inspection.id}
          equipmentId={activeEquipment.equipmentId}
          equipmentName={activeEquipment.equipmentName}
          equipmentCode={activeEquipment.equipmentCode}
          entry={
            inspection.equipments.find(
              (item) => item.equipmentId === activeEquipment.equipmentId,
            ) ?? activeEquipment.entry
          }
          defaultValues={
            inspection.equipments.find(
              (item) => item.equipmentId === activeEquipment.equipmentId,
            ) ?? activeEquipment.entry
          }
          disabled={isLocked}
          onSaved={refreshInspection}
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
            <AlertDialogTitle>Remove this equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `"${removeTarget.equipment.name}" and its measurements will be removed from this inspection.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoving}
              onClick={handleRemoveEquipment}
            >
              {isRemoving ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
