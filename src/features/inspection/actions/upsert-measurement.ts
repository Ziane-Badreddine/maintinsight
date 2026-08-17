"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  upsertMeasurementSchema,
  type UpsertMeasurementInput,
} from "../schemas/measurement.schema";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

async function assertDraftInspectionEquipment(
  inspectionEquipmentId: number,
  userId: string,
) {
  const ie = await prisma.inspectionEquipment.findUnique({
    where: { id: inspectionEquipmentId },
    include: { inspection: { select: { performedById: true, status: true } } },
  });

  if (!ie || ie.inspection.performedById !== userId) {
    return { ok: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (ie.inspection.status !== "DRAFT") {
    return { ok: false as const, error: "INSPECTION_LOCKED" };
  }

  return { ok: true as const };
}

export async function upsertMeasurement(input: UpsertMeasurementInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const parsed = upsertMeasurementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const { id, inspectionEquipmentId, type, point, value, unit } = parsed.data;

  const access = await assertDraftInspectionEquipment(
    inspectionEquipmentId,
    session.user.id,
  );
  if (!access.ok) {
    return { success: false as const, error: access.error };
  }

  if (id) {
    const existing = await prisma.measurement.findFirst({
      where: { id, inspectionEquipmentId },
    });
    if (!existing) {
      return { success: false as const, error: "NOT_FOUND" };
    }

    const measurement = await prisma.measurement.update({
      where: { id },
      data: { type, point, value, unit },
    });

    revalidatePath("/dashboard");
    return { success: true as const, measurement };
  }

  const measurement = await prisma.measurement.create({
    data: { inspectionEquipmentId, type, point, value, unit },
  });

  revalidatePath("/dashboard");
  return { success: true as const, measurement };
}
