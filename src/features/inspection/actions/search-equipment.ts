"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type EquipmentSearchOption = {
  id: number;
  name: string;
  code: string | null;
  workshopName: string;
  plantName: string;
};

export async function searchEquipmentForInspection(
  query: string,
  excludeIds: number[] = [],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { success: false as const, error: "UNAUTHENTICATED" };
  }

  const trimmed = query.trim();

  const equipments = await prisma.equipment.findMany({
    where: {
      id: { notIn: excludeIds },
      ...(trimmed
        ? {
            OR: [
              { name: { contains: trimmed, mode: "insensitive" } },
              { code: { contains: trimmed, mode: "insensitive" } },
              {
                workshop: {
                  name: { contains: trimmed, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    take: 20,
    orderBy: { name: "asc" },
    include: {
      workshop: {
        include: { plant: true },
      },
    },
  });

  return {
    success: true as const,
    equipments: equipments.map(
      (equipment): EquipmentSearchOption => ({
        id: equipment.id,
        name: equipment.name,
        code: equipment.code,
        workshopName: equipment.workshop.name,
        plantName: equipment.workshop.plant.name ?? equipment.workshop.plant.code,
      }),
    ),
  };
}
