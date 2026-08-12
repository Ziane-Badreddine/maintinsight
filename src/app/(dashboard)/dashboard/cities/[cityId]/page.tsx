// app/dashboard/cities/[cityId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OverviewStatCards } from "@/features/global/components/overview-stat-cards";
import {
  getCityHeaderInfo,
  getCityOverview,
  getCityStatusHistory,
} from "@/features/global/server/city-overview";
import { CityHeader } from "@/features/global/components/city-header";
import { CityHeaderSkeleton } from "@/features/global/components/city-header-skeleton";
import { CityOverviewSkeleton } from "@/features/global/components/city-overview-skeleton";
import { StatusSummaryCards } from "@/features/global/components/status-summary-cards";
import { EquipmentStatusChart } from "@/features/global/components/equipment-status-pie-chart";
import { EquipmentStatusRadarChart } from "@/features/global/components/equipment-status-radar-chart";
import { EquipmentStatusHistoryChart } from "@/features/global/components/equipment-status-history-chart";
import { EquipmentByWorkshopChart } from "@/features/global/components/equipment-by-workshop-chart";
import { EquipmentByPlantChart } from "@/features/global/components/equipment-by-plant-chart";
import { loadStatusHistorySearchParams } from "@/features/global/search-params/status-history";
import { CitySummaryTable } from "@/features/global/components/city-summary-table";
import { CityAttentionCards } from "@/features/global/components/city-attention-cards";
import { CityInspectionCoverageCard } from "@/features/global/components/city-inspection-coverage-card";
import { getCityInspectionCoverage } from "@/features/global/server/city-inspection-coverage";

export default async function CityDashboardPage({
  params,
  searchParams,
}: PageProps<"/dashboard/cities/[cityId]">) {
  const { cityId } = await params;
  const { from, to } = await loadStatusHistorySearchParams(searchParams);
  const id = Number(cityId);

  if (Number.isNaN(id)) notFound();

  return (
    <div className="flex flex-col">
      <Suspense fallback={<CityHeaderSkeleton />}>
        <CityHeaderSection cityId={id} />
      </Suspense>

      <Suspense fallback={<CityOverviewSkeleton />}>
        <CityOverviewContent cityId={id} from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function CityHeaderSection({ cityId }: { cityId: number }) {
  const city = await getCityHeaderInfo(cityId);

  if (!city) notFound();

  return <CityHeader cityId={cityId} plants={city.plants} />;
}

async function CityOverviewContent({
  cityId,
  from,
  to,
}: {
  cityId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);

  const [data, history, coverage] = await Promise.all([
    getCityOverview(cityId),
    getCityStatusHistory(cityId, {
      from: hasCompleteRange ? new Date(from!) : undefined,
      to: hasCompleteRange ? new Date(to!) : undefined,
      monthsBack: 12,
    }),
    getCityInspectionCoverage(cityId, { staleDays: 30 }),
  ]);

  if (!data) notFound();

  return (
    <div className="space-y-6 px-4 py-6">
      <OverviewStatCards cityName={data.city.name} totals={data.totals} />

      <StatusSummaryCards statusCounts={data.statusCounts} />

      <div className="grid gap-4 lg:grid-cols-3">
        <EquipmentByPlantChart data={data.equipmentByPlant} />
        <EquipmentStatusChart statusCounts={data.statusCounts} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <CitySummaryTable rows={data.equipmentByPlant} cityId={cityId} />
        <CityAttentionCards
          statusCounts={data.statusCounts}
          equipmentByPlant={data.equipmentByPlant}
        />
      </div>
      <div className="grid gap-4">
        <EquipmentStatusHistoryChart data={history} />
      </div>
      <div className="grid gap-4">
        <CityInspectionCoverageCard coverage={coverage} />
      </div>

      {/* 
      <div className="grid gap-4 lg:grid-cols-3">
        <EquipmentStatusRadarChart statusCounts={data.statusCounts} />
        <EquipmentByWorkshopChart data={data.equipmentByWorkshop} />
      </div> */}
    </div>
  );
}
