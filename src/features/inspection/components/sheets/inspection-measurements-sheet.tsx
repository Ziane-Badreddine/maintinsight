"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  upsertMeasurementSchema,
  type UpsertMeasurementInput,
} from "../../schemas/measurement.schema";
import { upsertMeasurement } from "../../actions/upsert-measurement";
import { MeasurementType } from "../../../../../prisma/generated/prisma/enums";
import type { Measurement } from "../../../../../prisma/generated/prisma/browser";
import { MEASUREMENT_TYPE_LABEL } from "../measurement-labels";
import {
  INSPECTION_SHEET_CLASS,
  INSPECTION_SHEET_SCROLL_CLASS,
} from "./inspection-sheet-styles";

interface InspectionMeasurementsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionEquipmentId: number;
  equipmentName: string;
  measurement?: Measurement | null;
  disabled?: boolean;
  onSaved: () => void;
}

export function InspectionMeasurementsSheet({
  open,
  onOpenChange,
  inspectionEquipmentId,
  equipmentName,
  measurement,
  disabled = false,
  onSaved,
}: InspectionMeasurementsSheetProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(measurement);

  const form = useForm<UpsertMeasurementInput>({
    resolver: zodResolver(
      upsertMeasurementSchema,
    ) as Resolver<UpsertMeasurementInput>,
    values: {
      id: measurement?.id,
      inspectionEquipmentId,
      type: measurement?.type ?? MeasurementType.VIBRATION,
      point: measurement?.point ?? "",
      value: measurement?.value ?? null,
      unit: measurement?.unit ?? "mm/s",
    },
  });

  function onSubmit(values: UpsertMeasurementInput) {
    startTransition(async () => {
      const result = await upsertMeasurement(values);
      if (!result.success) {
        toast.add({
          type: "error",
          title: isEdit
            ? "Could not update measurement"
            : "Could not create measurement",
          description: String(result.error),
        });
        return;
      }

      toast.add({
        type: "success",
        title: isEdit ? "Measurement updated" : "Measurement created",
      });
      onSaved();
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={INSPECTION_SHEET_CLASS}>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit measurement" : "New measurement"}
          </SheetTitle>
          <SheetDescription className="truncate">
            {equipmentName}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className={INSPECTION_SHEET_SCROLL_CLASS}>
          <form
            id="inspection-measurement-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 px-4 pb-4"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.type}>
                <FieldLabel>Type</FieldLabel>
                <Select
                  // eslint-disable-next-line react-hooks/incompatible-library
                  value={form.watch("type")}
                  disabled={disabled}
                  onValueChange={(value) =>
                    form.setValue("type", value as MeasurementType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEASUREMENT_TYPE_LABEL).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.type]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.point}>
                <FieldLabel htmlFor="point">Point</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="point"
                    disabled={disabled}
                    placeholder="1RV, 2RH, 3AV…"
                    {...form.register("point")}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>Point</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[form.formState.errors.point]} />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="value">Value</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="value"
                      type="number"
                      step="any"
                      disabled={disabled}
                      placeholder="0.0"
                      {...form.register("value")}
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="unit">Unit</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="unit"
                      disabled={disabled}
                      placeholder="mm/s, °C…"
                      {...form.register("unit")}
                    />
                  </InputGroup>
                </Field>
              </div>

              <FieldDescription>
                Record one reading for this equipment inspection.
              </FieldDescription>
            </FieldGroup>
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
              form="inspection-measurement-form"
              className="flex-1"
              disabled={disabled || isPending}
            >
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create measurement"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
