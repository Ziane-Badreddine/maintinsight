"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteEquipment(equipmentId: number) {
  try {
    await prisma.equipment.delete({ where: { id: equipmentId } });
  } catch {
    return { error: "Failed to delete equipment." };
  }
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function duplicateEquipment(equipmentId: number) {
  const original = await prisma.equipment.findUnique({
    where: { id: equipmentId },
  });
  if (!original) return { error: "Equipment not found." };

  try {
    await prisma.equipment.create({
      data: {
        name: `${original.name} (copy)`,
        code: original.code,
        workshopId: original.workshopId,
      },
    });
  } catch {
    return { error: "Failed to duplicate equipment." };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
