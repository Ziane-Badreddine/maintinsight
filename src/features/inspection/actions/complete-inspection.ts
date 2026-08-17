"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { InspectionStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function completeInspection(inspectionId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: { equipments: true },
  });

  if (!inspection || inspection.performedById !== session.user.id) {
    return { success: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (inspection.status !== InspectionStatus.DRAFT) {
    return { success: false as const, error: "ALREADY_COMPLETED_OR_VALIDATED" };
  }

  if (inspection.equipments.length === 0) {
    return {
      success: false as const,
      error: "AT_LEAST_ONE_EQUIPMENT_REQUIRED",
    };
  }

  const updated = await prisma.inspection.update({
    where: { id: inspectionId },
    data: { status: InspectionStatus.COMPLETED },
  });

  revalidatePath("/dashboard");
  return { success: true as const, inspection: updated };
}
