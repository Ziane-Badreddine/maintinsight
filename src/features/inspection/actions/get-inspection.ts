"use server";

import { auth } from "@/lib/auth";
import { hasSessionPermission } from "@/lib/auth-permissions";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getInspection(inspectionId: number) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const canViewAnyInspection = await hasSessionPermission(
    { inspection: ["validate"] },
    requestHeaders,
  );

  const inspection = await prisma.inspection.findFirst({
    where: canViewAnyInspection
      ? { id: inspectionId }
      : { id: inspectionId, performedById: session.user.id },
    include: {
      equipments: {
        include: { equipment: true, measurements: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!inspection) {
    return { success: false as const, error: "NOT_FOUND" };
  }

  return { success: true as const, inspection };
}
