import { prisma } from "@/lib/prisma";
import { CityEquipmentRow } from "./city-equipment-columns";
import { StatCards } from "@/features/plant/components/stat-cards";
import { CityEquipmentDataTable } from "./city-equipment-data-table";
import { EquipmentStatusBarChart } from "./equipment-status-bar-chart";

async function getCityEquipmentsOverview(cityId: number) {
  const equipments = await prisma.equipment.findMany({
    where: { workshop: { plant: { cityId } } },
    include: {
      workshop: {
        include: { plant: true },
      },
      inspections: {
        orderBy: { inspection: { inspectionDate: "desc" } },
        take: 1,
        include: { inspection: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const statusCounts: Record<string, number> = {};

  const equipmentRows: CityEquipmentRow[] = equipments.map((eq) => {
    const latest = eq.inspections[0] ?? null;
    const status = (latest?.status ??
      "NOT_MONITORED") as CityEquipmentRow["status"];
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;

    return {
      id: eq.id,
      name: eq.name,
      code: eq.code,
      workshopId: eq.workshopId,
      workshopName: eq.workshop.name,
      plantId: eq.workshop.plantId,
      plantName: eq.workshop.plant.name ?? eq.workshop.plant.code,
      status,
      diagnosis: latest?.diagnosis ?? null,
      lastInspectionDate: latest?.inspection.inspectionDate ?? null,
    };
  });

  const total = equipmentRows.length;
  const healthy = (statusCounts.GOOD ?? 0) + (statusCounts.ACCEPTABLE ?? 0);
  const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;

  return { total, healthRate, statusCounts, equipmentRows };
}

interface EquipmentsOverviewLoaderProps {
  cityId: number;
}

export async function EquipmentsOverviewLoader({
  cityId,
}: EquipmentsOverviewLoaderProps) {
  const { total, healthRate, statusCounts, equipmentRows } =
    await getCityEquipmentsOverview(cityId);

  return (
    <div className="flex flex-col gap-6">
      <StatCards
        total={total}
        healthRate={healthRate}
        statusCounts={statusCounts}
      />

      <EquipmentStatusBarChart statusCounts={statusCounts} />

      <CityEquipmentDataTable data={equipmentRows} />
    </div>
  );
}
