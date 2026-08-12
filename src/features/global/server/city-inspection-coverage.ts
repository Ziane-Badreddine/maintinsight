// features/global/server/city-inspection-coverage.ts
import { prisma } from "@/lib/prisma";
import { differenceInDays, subDays } from "date-fns";

export type InspectionCoverageBucket = "recent" | "stale" | "never";

export type EquipmentCoverageRow = {
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string | null;
  plantName: string;
  workshopName: string;
  lastInspectionDate: Date | null;
  daysSinceLastInspection: number | null;
  bucket: InspectionCoverageBucket;
};

export type CityInspectionCoverage = {
  totalEquipments: number;
  recentCount: number;
  staleCount: number;
  neverCount: number;
  staleDays: number;
  /** Equipments in the "stale" or "never" bucket, worst-first, capped. */
  attentionList: EquipmentCoverageRow[];
};

/**
 * Only DRAFT inspections are excluded from "last inspection" — a draft
 * hasn't been signed off, so it shouldn't count as coverage yet.
 */
const COUNTED_INSPECTION_STATUSES = ["COMPLETED", "VALIDATED"] as const;

export async function getCityInspectionCoverage(
  cityId: number,
  options?: { staleDays?: number; attentionLimit?: number },
): Promise<CityInspectionCoverage> {
  const staleDays = options?.staleDays ?? 30;
  const attentionLimit = options?.attentionLimit ?? 25;

  const now = new Date();
  const staleThreshold = subDays(now, staleDays);

  const equipments = await prisma.equipment.findMany({
    where: { workshop: { plant: { cityId } } },
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
      inspections: {
        where: {
          inspection: { status: { in: [...COUNTED_INSPECTION_STATUSES] } },
        },
        select: { inspection: { select: { inspectionDate: true } } },
        orderBy: { inspection: { inspectionDate: "desc" } },
        take: 1,
      },
    },
  });

  let recentCount = 0;
  let staleCount = 0;
  let neverCount = 0;
  const attentionList: EquipmentCoverageRow[] = [];

  for (const eq of equipments) {
    const lastInspectionDate =
      eq.inspections[0]?.inspection.inspectionDate ?? null;

    const plantName = eq.workshop.plant.name ?? eq.workshop.plant.code;

    if (!lastInspectionDate) {
      neverCount += 1;
      attentionList.push({
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentCode: eq.code,
        plantName,
        workshopName: eq.workshop.name,
        lastInspectionDate: null,
        daysSinceLastInspection: null,
        bucket: "never",
      });
      continue;
    }

    if (lastInspectionDate < staleThreshold) {
      staleCount += 1;
      attentionList.push({
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentCode: eq.code,
        plantName,
        workshopName: eq.workshop.name,
        lastInspectionDate,
        daysSinceLastInspection: differenceInDays(now, lastInspectionDate),
        bucket: "stale",
      });
      continue;
    }

    recentCount += 1;
  }

  // Worst first: never-inspected equipments (no date to sort by) come
  // before stale ones, then stale ones sorted by longest-overdue.
  attentionList.sort((a, b) => {
    if (a.bucket !== b.bucket) return a.bucket === "never" ? -1 : 1;
    return (b.daysSinceLastInspection ?? 0) - (a.daysSinceLastInspection ?? 0);
  });

  return {
    totalEquipments: equipments.length,
    recentCount,
    staleCount,
    neverCount,
    staleDays,
    attentionList: attentionList.slice(0, attentionLimit),
  };
}
