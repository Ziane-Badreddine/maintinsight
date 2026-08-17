import { z } from "zod";
import { MeasurementType } from "../../../../prisma/generated/prisma/enums";

export const measurementSchema = z.object({
  type: z.enum(MeasurementType),
  point: z.string().min(1, "Measurement point is required").max(50),
  value: z.coerce.number().optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
});

export const upsertMeasurementSchema = measurementSchema.extend({
  inspectionEquipmentId: z.number().int().positive(),
  id: z.number().int().positive().optional(),
});

export const measurementsBatchSchema = z.object({
  inspectionEquipmentId: z.number().int().positive(),
  measurements: z.array(measurementSchema),
});

export type MeasurementInput = z.infer<typeof measurementSchema>;
export type UpsertMeasurementInput = z.infer<typeof upsertMeasurementSchema>;
export type MeasurementsBatchInput = z.infer<typeof measurementsBatchSchema>;
