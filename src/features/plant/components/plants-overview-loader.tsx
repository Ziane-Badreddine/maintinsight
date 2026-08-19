import { prisma } from "@/lib/prisma";
import { PlantRow } from "./plant-columns";
import { StatCards } from "./stat-cards";
import { PlantBarChart } from "./plant-bar-chart";
import { PlantsDataTable } from "./plants-data-table";

async function getCityPlantsOverview(cityId: number) {
  const plants = await prisma.plant.findMany({
    where: { cityId },
    include: {
      workshops: {
        include: {
          equipments: {
            include: {
              inspections: {
                orderBy: { inspection: { inspectionDate: "desc" } },
                take: 1,
                include: { inspection: true },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const cityStatusCounts: Record<string, number> = {};
  const byPlant: Record<string, Record<string, number>> = {};

  const plantRows: PlantRow[] = plants.map((plant) => {
    const statusCounts: Record<string, number> = {};
    let equipmentTotal = 0;

    for (const workshop of plant.workshops) {
      for (const eq of workshop.equipments) {
        const latest = eq.inspections[0] ?? null;
        const status = latest?.status ?? "NOT_MONITORED";
        statusCounts[status] = (statusCounts[status] ?? 0) + 1;
        cityStatusCounts[status] = (cityStatusCounts[status] ?? 0) + 1;
        equipmentTotal += 1;
      }
    }

    byPlant[plant.name ?? plant.code] = statusCounts;

    const healthy = (statusCounts.GOOD ?? 0) + (statusCounts.ACCEPTABLE ?? 0);
    const healthRate =
      equipmentTotal > 0 ? Math.round((healthy / equipmentTotal) * 100) : 0;

    return {
      id: plant.id,
      name: plant.name ?? plant.code,
      code: plant.code,
      workshopsCount: plant.workshops.length,
      equipmentTotal,
      healthRate,
      statusCounts: statusCounts as PlantRow["statusCounts"],
    };
  });

  const total = plantRows.reduce((sum, p) => sum + p.equipmentTotal, 0);
  const healthy =
    (cityStatusCounts.GOOD ?? 0) + (cityStatusCounts.ACCEPTABLE ?? 0);
  const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;

  return {
    total,
    healthRate,
    statusCounts: cityStatusCounts,
    byPlant,
    plantRows,
  };
}

interface PlantsOverviewLoaderProps {
  cityId: number;
}

export async function PlantsOverviewLoader({
  cityId,
}: PlantsOverviewLoaderProps) {
  const { total, healthRate, statusCounts, byPlant, plantRows } =
    await getCityPlantsOverview(cityId);

  return (
    <div className="flex flex-col gap-6">
      <StatCards
        total={total}
        healthRate={healthRate}
        statusCounts={statusCounts}
      />

      <PlantBarChart byPlant={byPlant} />
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusDonutChart statusCounts={statusCounts} />
      </div> */}

      <PlantsDataTable data={plantRows} />
    </div>
  );
}
