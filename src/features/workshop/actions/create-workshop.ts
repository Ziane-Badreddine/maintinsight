"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const workshopSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export async function createWorkshop(plantId: number, formData: FormData) {
  const parsed = workshopSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await prisma.workshop.create({
      data: { ...parsed.data, plantId },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.code === "P2002") {
      return {
        error: "A workshop with this name already exists in this plant.",
      };
    }
    return { error: "Something went wrong." };
  }

  revalidatePath(
    `/dashboard/cities/[cityId]/plants/${plantId}/workshops`,
    "page",
  );
  return { success: true };
}
