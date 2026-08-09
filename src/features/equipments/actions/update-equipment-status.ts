"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "GOOD",
    "ACCEPTABLE",
    "ALERT",
    "ALARM",
    "STOPPED",
    "NOT_MONITORED",
  ]),
  diagnosis: z.string().trim().optional(),
  recommendation: z.string().trim().optional(),
});

/**
 * Quick status update — creates a new Inspection (today, one equipment)
 * rather than mutating history, keeping the audit trail intact.
 */
export async function updateEquipmentStatus(
  equipmentId: number,
  performedById: string,
  formData: FormData,
) {
  const parsed = statusSchema.safeParse({
    status: formData.get("status"),
    diagnosis: formData.get("diagnosis") || undefined,
    recommendation: formData.get("recommendation") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid status." };
  }

  try {
    const inspection = await prisma.inspection.create({
      data: {
        status: "COMPLETED",
        inspectionDate: new Date(),
        performedById,
      },
    });

    await prisma.inspectionEquipment.create({
      data: {
        inspectionId: inspection.id,
        equipmentId,
        status: parsed.data.status,
        diagnosis: parsed.data.diagnosis,
        recommendation: parsed.data.recommendation,
      },
    });
  } catch {
    return { error: "Something went wrong." };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
