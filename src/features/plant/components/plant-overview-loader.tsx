import { prisma } from "@/lib/prisma";
import { StatCards } from "./stat-cards";
import { StatusDonutChart } from "./status-donut-chart";
import { WorkshopBarChart } from "./workshop-bar-chart";

import { EquipmentDataTable } from "@/features/dashboard/components/equipment-data-table";
import type { EquipmentRow } from "@/features/dashboard/components/equipment-columns";
import { subDays, format } from "date-fns";
import {
  InspectionStatusAreaChart,
  InspectionStatusPoint,
} from "@/features/dashboard/components/inspection-status-area-chart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

async function getPlantOverview(plantId: number) {
  const equipments = await prisma.equipment.findMany({
    where: { workshop: { plantId } },
    include: {
      workshop: true,
      inspections: {
        orderBy: { inspection: { inspectionDate: "desc" } },
        take: 1,
        include: { inspection: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const withStatus = equipments.map((eq) => ({
    ...eq,
    latest: eq.inspections[0] ?? null,
  }));

  const statusCounts: Record<string, number> = {};
  for (const eq of withStatus) {
    const status = eq.latest?.status ?? "NOT_MONITORED";
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
  }

  const byWorkshop = withStatus.reduce<Record<string, Record<string, number>>>(
    (acc, eq) => {
      const workshopName = eq.workshop.name;
      const status = eq.latest?.status ?? "NOT_MONITORED";
      acc[workshopName] ??= {};
      acc[workshopName][status] = (acc[workshopName][status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const total = withStatus.length;
  const healthy = (statusCounts.GOOD ?? 0) + (statusCounts.ACCEPTABLE ?? 0);
  const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;

  const equipmentRows: EquipmentRow[] = withStatus.map((eq) => ({
    id: eq.id,
    name: eq.name,
    code: eq.code,
    workshop: eq.workshop,
    status: (eq.latest?.status ?? "NOT_MONITORED") as EquipmentRow["status"],
    diagnosis: eq.latest?.diagnosis ?? null,
    lastInspectionDate: eq.latest?.inspection.inspectionDate ?? null,
  }));

  return {
    total,
    healthRate,
    statusCounts,
    byWorkshop,
    equipmentRows,
  };
}

/**
 * Daily count of inspections per InspectionStatus, over the last 90 days.
 * Days with zero inspections are filled with 0 so the area chart doesn't
 * have gaps.
 */
async function getInspectionStatusOverTime(
  plantId: number,
): Promise<InspectionStatusPoint[]> {
  const since = subDays(new Date(), 90);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }

  const inspections = await prisma.inspection.findMany({
    where: {
      performedById: session?.user.id,
      inspectionDate: { gte: since },
      equipments: {
        some: { equipment: { workshop: { plantId } } },
      },
    },
    select: { status: true, inspectionDate: true },
    orderBy: { inspectionDate: "asc" },
  });

  const byDate = new Map<string, InspectionStatusPoint>();

  // seed every day in range with zeros so the chart has a continuous axis
  for (let i = 0; i <= 90; i++) {
    const key = format(subDays(new Date(), 90 - i), "yyyy-MM-dd");
    byDate.set(key, { date: key, DRAFT: 0, COMPLETED: 0, VALIDATED: 0 });
  }

  for (const inspection of inspections) {
    const key = format(inspection.inspectionDate, "yyyy-MM-dd");
    const point = byDate.get(key);
    if (point) {
      point[inspection.status] += 1;
    }
  }

  return Array.from(byDate.values());
}

interface PlantOverviewLoaderProps {
  plantId: number;
}

export async function PlantOverviewLoader({
  plantId,
}: PlantOverviewLoaderProps) {
  const [
    { total, healthRate, statusCounts, byWorkshop, equipmentRows },
    inspectionStatusOverTime,
  ] = await Promise.all([
    getPlantOverview(plantId),
    getInspectionStatusOverTime(plantId),
  ]);

  return (
    <>
      <StatCards
        total={total}
        healthRate={healthRate}
        statusCounts={statusCounts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusDonutChart statusCounts={statusCounts} />
        <WorkshopBarChart byWorkshop={byWorkshop} />
      </div>

      <InspectionStatusAreaChart data={inspectionStatusOverTime} />

      <EquipmentDataTable data={equipmentRows} />
    </>
  );
}
