"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteEquipments(equipmentIds: number[]) {
  try {
    await prisma.equipment.deleteMany({ where: { id: { in: equipmentIds } } });
  } catch {
    return { error: "Failed to delete equipments." };
  }
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
