// features/inspection/actions/upsert-inspection-equipment.ts
"use server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  inspectionEquipmentSchema,
  type InspectionEquipmentInput,
} from "../schemas/inspection-equipment.schema";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function upsertInspectionEquipment(
  input: InspectionEquipmentInput,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const parsed = inspectionEquipmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const { inspectionId, equipmentId, status, diagnosis, recommendation, note } =
    parsed.data;

  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    select: { performedById: true, status: true },
  });

  if (!inspection || inspection.performedById !== session.user.id) {
    return { success: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (inspection.status !== "DRAFT") {
    return { success: false as const, error: "INSPECTION_LOCKED" };
  }

  const result = await prisma.inspectionEquipment.upsert({
    where: {
      inspectionId_equipmentId: { inspectionId, equipmentId },
    },
    create: {
      inspectionId,
      equipmentId,
      status,
      diagnosis,
      recommendation,
      note,
    },
    update: {
      status,
      diagnosis,
      recommendation,
      note,
    },
  });

  revalidatePath("/dashboard");
  return { success: true as const, inspectionEquipment: result };
}
