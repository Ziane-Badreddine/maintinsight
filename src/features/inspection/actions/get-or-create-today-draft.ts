// features/inspection/actions/get-or-create-today-draft.ts
"use server";

import { auth } from "@/lib/auth";

import { getDayRange } from "../lib/day-range";
import { headers } from "next/headers";
import { InspectionStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function getOrCreateTodayDraftInspection() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const { start, end } = getDayRange();

  // 1. Look for an existing inspection for this agent, today
  const existing = await prisma.inspection.findFirst({
    where: {
      performedById: session.user.id,
      inspectionDate: { gte: start, lte: end },
      status: { in: [InspectionStatus.DRAFT, InspectionStatus.COMPLETED] },
    },
    include: {
      equipments: {
        include: { equipment: true, measurements: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return { success: true as const, inspection: existing, isNew: false };
  }

  // 2. None found → create a fresh draft
  const created = await prisma.inspection.create({
    data: {
      inspectionDate: new Date(),
      status: InspectionStatus.DRAFT,
      performedById: session.user.id,
    },
    include: {
      equipments: {
        include: { equipment: true, measurements: true },
      },
    },
  });

  return { success: true as const, inspection: created, isNew: true };
}
