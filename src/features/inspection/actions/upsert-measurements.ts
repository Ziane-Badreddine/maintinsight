"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  measurementsBatchSchema,
  type MeasurementsBatchInput,
} from "../schemas/measurement.schema";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function upsertMeasurements(input: MeasurementsBatchInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const parsed = measurementsBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const { inspectionEquipmentId, measurements } = parsed.data;

  const ie = await prisma.inspectionEquipment.findUnique({
    where: { id: inspectionEquipmentId },
    include: { inspection: { select: { performedById: true, status: true } } },
  });

  if (!ie || ie.inspection.performedById !== session.user.id) {
    return { success: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (ie.inspection.status !== "DRAFT") {
    return { success: false as const, error: "INSPECTION_LOCKED" };
  }

  await prisma.$transaction([
    prisma.measurement.deleteMany({ where: { inspectionEquipmentId } }),
    prisma.measurement.createMany({
      data: measurements.map((m) => ({ ...m, inspectionEquipmentId })),
    }),
  ]);

  revalidatePath("/dashboard");
  return { success: true as const };
}
