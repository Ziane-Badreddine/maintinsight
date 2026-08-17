"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function deleteInspectionEquipment(inspectionEquipmentId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const entry = await prisma.inspectionEquipment.findUnique({
    where: { id: inspectionEquipmentId },
    include: {
      inspection: { select: { performedById: true, status: true } },
    },
  });

  if (!entry || entry.inspection.performedById !== session.user.id) {
    return { success: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (entry.inspection.status !== "DRAFT") {
    return { success: false as const, error: "INSPECTION_LOCKED" };
  }

  await prisma.inspectionEquipment.delete({
    where: { id: inspectionEquipmentId },
  });

  revalidatePath("/dashboard");
  return { success: true as const };
}
