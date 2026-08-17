"use server";

import { auth } from "@/lib/auth";
import { hasSessionPermission } from "@/lib/auth-permissions";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { InspectionStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function validateInspection(inspectionId: number) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const canValidate = await hasSessionPermission(
    { inspection: ["validate"] },
    requestHeaders,
  );
  if (!canValidate) {
    return { success: false as const, error: "FORBIDDEN" };
  }

  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
  });

  if (!inspection) {
    return { success: false as const, error: "NOT_FOUND" };
  }

  if (inspection.status !== InspectionStatus.COMPLETED) {
    return { success: false as const, error: "INVALID_STATUS" };
  }

  const updated = await prisma.inspection.update({
    where: { id: inspectionId },
    data: { status: InspectionStatus.VALIDATED },
  });

  revalidatePath("/dashboard");
  return { success: true as const, inspection: updated };
}
