import { z } from "zod";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

export const inspectionEquipmentSchema = z.object({
  inspectionId: z.number().int().positive(),
  equipmentId: z.number().int().positive(),
  status: z.enum(EquipmentStatus),
  diagnosis: z.string().max(2000).optional().nullable(),
  recommendation: z.string().max(2000).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export type InspectionEquipmentInput = z.infer<
  typeof inspectionEquipmentSchema
>;
