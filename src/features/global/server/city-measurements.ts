// features/global/server/city-measurements.ts
import { prisma } from "@/lib/prisma";
import { MeasurementType } from "../../../../prisma/generated/prisma/enums";

interface DateRange {
  from?: Date;
  to?: Date;
}

export async function getMeasurementTypeBreakdown(
  cityId: number,
  range?: DateRange,
) {
  const measurements = await prisma.measurement.groupBy({
    by: ["type"],
    where: {
      inspectionEquipment: {
        equipment: { workshop: { plant: { cityId } } },
      },
      createdAt: {
        gte: range?.from,
        lte: range?.to,
      },
    },
    _count: { _all: true },
  });

  return measurements.map((m) => ({
    type: m.type,
    count: m._count._all,
  }));
}

export async function getMeasurementTrend(
  cityId: number,
  type: MeasurementType,
  monthsBack = 6,
) {
  const from = new Date();
  from.setMonth(from.getMonth() - monthsBack);

  const measurements = await prisma.measurement.findMany({
    where: {
      type,
      value: { not: null },
      createdAt: { gte: from },
      inspectionEquipment: {
        equipment: { workshop: { plant: { cityId } } },
      },
    },
    select: {
      value: true,
      unit: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Regroupe par mois — moyenne des valeurs pour lisser la tendance
  const byMonth = new Map<
    string,
    { sum: number; count: number; unit: string | null }
  >();

  for (const m of measurements) {
    if (m.value === null) continue;
    const key = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, "0")}`;
    const existing = byMonth.get(key) ?? { sum: 0, count: 0, unit: m.unit };
    existing.sum += m.value;
    existing.count += 1;
    byMonth.set(key, existing);
  }

  return Array.from(byMonth.entries()).map(([month, { sum, count, unit }]) => ({
    month,
    average: Number((sum / count).toFixed(2)),
    unit,
    sampleSize: count,
  }));
}

export async function getRecentMeasurements(cityId: number, limit = 20) {
  return prisma.measurement.findMany({
    where: {
      inspectionEquipment: {
        equipment: { workshop: { plant: { cityId } } },
      },
    },
    select: {
      id: true,
      type: true,
      point: true,
      value: true,
      unit: true,
      createdAt: true,
      inspectionEquipment: {
        select: {
          status: true,
          equipment: {
            select: {
              id: true,
              name: true,
              code: true,
              workshop: {
                select: {
                  name: true,
                  plant: { select: { name: true, code: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type RecentMeasurement = Awaited<
  ReturnType<typeof getRecentMeasurements>
>[number];
