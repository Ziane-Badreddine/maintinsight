/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const equipmentSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  code: z.string().trim().optional(),
  workshopId: z.number(),
});

export async function updateEquipment(equipmentId: number, formData: FormData) {
  const parsed = equipmentSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    workshopId: Number(formData.get("workshopId")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: parsed.data,
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      return {
        error: "An equipment with this name already exists in this workshop.",
      };
    }
    return { error: "Something went wrong." };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
