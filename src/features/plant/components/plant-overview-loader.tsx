import { prisma } from "@/lib/prisma";
import { StatCards } from "./stat-cards";
import { StatusDonutChart } from "./status-donut-chart";
import { WorkshopBarChart } from "./workshop-bar-chart";
import { EquipmentDataTable } from "@/features/dashboard/components/equipment-data-table";
import type { EquipmentRow } from "@/features/dashboard/components/equipment-columns";

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

  // Latest status per equipment (or NOT_MONITORED if never inspected)
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

  // Map to the shape EquipmentDataTable actually expects
  const equipmentRows: EquipmentRow[] = withStatus.map((eq) => ({
    id: eq.id,
    name: eq.name,
    code: eq.code,
    workshopName: eq.workshop.name,
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

interface PlantOverviewLoaderProps {
  plantId: number;
}

export async function PlantOverviewLoader({
  plantId,
}: PlantOverviewLoaderProps) {
  const { total, healthRate, statusCounts, byWorkshop, equipmentRows } =
    await getPlantOverview(plantId);

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

      <EquipmentDataTable data={equipmentRows} />
    </>
  );
}
