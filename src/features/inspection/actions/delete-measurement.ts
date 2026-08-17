"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function deleteMeasurement(measurementId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const measurement = await prisma.measurement.findUnique({
    where: { id: measurementId },
    include: {
      inspectionEquipment: {
        include: {
          inspection: { select: { performedById: true, status: true } },
        },
      },
    },
  });

  if (
    !measurement ||
    measurement.inspectionEquipment.inspection.performedById !==
      session.user.id
  ) {
    return { success: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (measurement.inspectionEquipment.inspection.status !== "DRAFT") {
    return { success: false as const, error: "INSPECTION_LOCKED" };
  }

  await prisma.measurement.delete({ where: { id: measurementId } });

  revalidatePath("/dashboard");
  return { success: true as const };
}
