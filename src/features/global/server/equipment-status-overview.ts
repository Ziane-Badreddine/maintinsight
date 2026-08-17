// features/global/server/equipment-status-overview.ts
import { prisma } from "@/lib/prisma";

export async function getEquipmentStatusOverview(
  cityId: number,
  plantId: number | null,
) {
  const equipments = await prisma.equipment.findMany({
    where: { workshop: { plant: { cityId, id: plantId ?? undefined } } },
    select: {
      id: true,
      code: true,
      name: true,
      scope: true,
      type: { select: { name: true } },
      workshop: {
        select: {
          name: true,
          plant: { select: { name: true, code: true } },
        },
      },
      inspections: {
        select: {
          status: true,
          diagnosis: true,
          recommendation: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
    take: 10,
  });

  return equipments.map((eq) => {
    const latest = eq.inspections[0];
    return {
      id: eq.id,
      code: eq.code,
      name: eq.name,
      scope: eq.scope,
      type: eq.type?.name ?? null,
      workshop: eq.workshop,
      status: latest?.status ?? "NOT_MONITORED",
      diagnosis: latest?.diagnosis ?? null,
      lastInspectedAt: latest?.createdAt ?? null,
    };
  });
}

export type EquipmentStatusRow = Awaited<
  ReturnType<typeof getEquipmentStatusOverview>
>[number];
