// src/app/dashboard/cities/[cityId]/workshops/workshops-overview-loader.tsx
import { prisma } from "@/lib/prisma";
import { CityWorkshopRow } from "./city-workshop-columns";
import { StatCards } from "@/features/plant/components/stat-cards";
import { WorkshopBarChart } from "@/features/plant/components/workshop-bar-chart";
import { CityWorkshopsDataTable } from "./city-workshops-data-table";

async function getCityWorkshopsOverview(cityId: number) {
  const workshops = await prisma.workshop.findMany({
    where: { plant: { cityId } },
    include: {
      plant: true,
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
    orderBy: { name: "asc" },
  });

  const cityStatusCounts: Record<string, number> = {};
  const byWorkshop: Record<string, Record<string, number>> = {};

  const workshopRows: CityWorkshopRow[] = workshops.map((workshop) => {
    const statusCounts: Record<string, number> = {};
    let equipmentTotal = 0;

    for (const eq of workshop.equipments) {
      const latest = eq.inspections[0] ?? null;
      const status = latest?.status ?? "NOT_MONITORED";
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
      cityStatusCounts[status] = (cityStatusCounts[status] ?? 0) + 1;
      equipmentTotal += 1;
    }

    byWorkshop[workshop.name] = statusCounts;

    const healthy = (statusCounts.GOOD ?? 0) + (statusCounts.ACCEPTABLE ?? 0);
    const healthRate =
      equipmentTotal > 0 ? Math.round((healthy / equipmentTotal) * 100) : 0;

    return {
      id: workshop.id,
      name: workshop.name,
      code: workshop.code,
      plantId: workshop.plantId,
      plantName: workshop.plant.name ?? workshop.plant.code,
      equipmentTotal,
      healthRate,
      statusCounts: statusCounts as CityWorkshopRow["statusCounts"],
    };
  });

  const total = workshopRows.reduce((sum, w) => sum + w.equipmentTotal, 0);
  const healthy =
    (cityStatusCounts.GOOD ?? 0) + (cityStatusCounts.ACCEPTABLE ?? 0);
  const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;

  return {
    total,
    healthRate,
    statusCounts: cityStatusCounts,
    byWorkshop,
    workshopRows,
  };
}

interface WorkshopsOverviewLoaderProps {
  cityId: number;
}

export async function WorkshopsOverviewLoader({
  cityId,
}: WorkshopsOverviewLoaderProps) {
  const { total, healthRate, statusCounts, byWorkshop, workshopRows } =
    await getCityWorkshopsOverview(cityId);

  return (
    <div className="flex flex-col gap-6">
      <StatCards
        total={total}
        healthRate={healthRate}
        statusCounts={statusCounts}
      />

      <WorkshopBarChart byWorkshop={byWorkshop} />
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusDonutChart statusCounts={statusCounts} />
      </div> */}

      <CityWorkshopsDataTable data={workshopRows} />
    </div>
  );
}
