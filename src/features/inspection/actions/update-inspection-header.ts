"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  inspectionCommentSchema,
  type InspectionCommentInput,
} from "../schemas/inspection.schema";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function updateInspectionComment(
  inspectionId: number,
  input: InspectionCommentInput,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const parsed = inspectionCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const inspection = await prisma.inspection.findUnique({
    where: { id: inspectionId },
  });

  if (!inspection || inspection.performedById !== session.user.id) {
    return { success: false as const, error: "NOT_FOUND_OR_FORBIDDEN" };
  }

  if (inspection.status !== "DRAFT") {
    return { success: false as const, error: "INSPECTION_LOCKED" };
  }

  const updated = await prisma.inspection.update({
    where: { id: inspectionId },
    data: { comment: parsed.data.comment },
  });

  revalidatePath("/dashboard");
  return { success: true as const, inspection: updated };
}
