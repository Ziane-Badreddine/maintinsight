import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MeasurementType } from "../../../../../../prisma/generated/prisma/enums";

import {
  getCityOverview,
  getCityStatusHistory,
  getPlantsOverview,
  getWorkshopsOverview,
} from "@/features/global/server/city-overview";

import { getCityInspectionCoverage } from "@/features/global/server/city-inspection-coverage";

import {
  getMeasurementTrend,
  getMeasurementTypeBreakdown,
} from "@/features/global/server/city-measurements";

import { getEquipmentStatusOverview } from "@/features/global/server/equipment-status-overview";

import { loadStatusHistorySearchParams } from "@/features/global/search-params/status-history";
import { loadMeasurementTrendSearchParams } from "@/features/global/search-params/measurement-trend";
import { loadEquipmentStatusOverviewSearchParams } from "@/features/global/search-params/equipment-status-overview";

import { DashboardGrid } from "@/features/global/components/dashboard-grid";

import { OverviewStatCards } from "@/features/global/components/overview-stat-cards";
import { StatusSummaryCards } from "@/features/global/components/status-summary-cards";
import { EquipmentStatusChart } from "@/features/global/components/equipment-status-pie-chart";
import { EquipmentStatusHistoryChart } from "@/features/global/components/equipment-status-history-chart";
import { EquipmentByPlantChart } from "@/features/global/components/equipment-by-plant-chart";
import { CitySummaryTable } from "@/features/global/components/city-summary-table";
import { CityAttentionCards } from "@/features/global/components/city-attention-cards";
import { CityInspectionCoverageCard } from "@/features/global/components/city-inspection-coverage-card";
import { MeasurementTypeBreakdownChart } from "@/features/global/components/measurement-type-breakdown-chart";
import { MeasurementTrendChart } from "@/features/global/components/measurement-trend-chart";
import { EquipmentDataTable } from "@/features/global/components/equipment-data-table";
import { PlantsOverviewTable } from "@/features/global/components/plants-overview-table";

import { Skeleton } from "@/components/ui/skeleton";
import { WorkshopsOverviewTable } from "@/features/global/components/workshops-overview-table";
import { loadWorkshopsOverviewSearchParams } from "@/features/global/search-params/workshops-overview";
// add these imports
import { getCityAlarmsOverview } from "@/features/global/server/city-alarms-overview";
import { loadAlarmsOverviewSearchParams } from "@/features/global/search-params/alarms-overview";
import { AlarmsOverviewTable } from "@/features/global/components/alarms-overview-table";

/* -------------------------------------------------------------------------- */
/*                                  CACHING                                   */
/* -------------------------------------------------------------------------- */

const getCityOverviewCached = cache(async (cityId: number) =>
  getCityOverview(cityId),
);

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/cities/[cityId]">): Promise<Metadata> {
  const { cityId } = await params;
  const data = await getCityOverviewCached(Number(cityId));

  if (!data) notFound();

  return {
    title: data.city.name,
    description: `Overview of ${data.city.name}: equipment, inspections, and alerts.`,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  SKELETONS                                 */
/* -------------------------------------------------------------------------- */

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

function StatusSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function AttentionCardsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="rounded-xl border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AlarmsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />

      <div className="rounded-xl border">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PAGE COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default async function CityDashboardPage({
  params,
  searchParams,
}: PageProps<"/dashboard/cities/[cityId]">) {
  const { cityId } = await params;
  const [
    { from, to },
    { measurementType },
    { equipmentPlantId },
    { workshopPlantId },
    { alarmPlantId },
  ] = await Promise.all([
    loadStatusHistorySearchParams(searchParams),
    loadMeasurementTrendSearchParams(searchParams),
    loadEquipmentStatusOverviewSearchParams(searchParams),
    loadWorkshopsOverviewSearchParams(searchParams),
    loadAlarmsOverviewSearchParams(searchParams),
  ]);

  const id = Number(cityId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <div className="">
        <DashboardGrid
          widgets={{
            "stat-cards": (
              <Suspense fallback={<StatCardsSkeleton />}>
                <StatCardsSection cityId={id} />
              </Suspense>
            ),

            "status-summary": (
              <Suspense fallback={<StatusSummarySkeleton />}>
                <StatusSummarySection cityId={id} />
              </Suspense>
            ),

            "equipment-by-plant": (
              <Suspense fallback={<ChartSkeleton />}>
                <EquipmentByPlantSection cityId={id} />
              </Suspense>
            ),

            "equipment-status-chart": (
              <Suspense fallback={<ChartSkeleton />}>
                <EquipmentStatusSection cityId={id} />
              </Suspense>
            ),

            "city-summary-table": (
              <Suspense fallback={<TableSkeleton />}>
                <CitySummarySection cityId={id} />
              </Suspense>
            ),

            "city-attention-cards": (
              <Suspense fallback={<AttentionCardsSkeleton />}>
                <CityAttentionSection cityId={id} />
              </Suspense>
            ),
            "alarms-overview": (
              <Suspense fallback={<AlarmsTableSkeleton />}>
                <AlarmsOverviewSection cityId={id} plantId={alarmPlantId} />
              </Suspense>
            ),

            "status-history-chart": (
              <Suspense fallback={<ChartSkeleton />}>
                <StatusHistorySection cityId={id} from={from} to={to} />
              </Suspense>
            ),

            "inspection-coverage": (
              <Suspense fallback={<CardSkeleton />}>
                <InspectionCoverageSection cityId={id} />
              </Suspense>
            ),

            "measurement-breakdown": (
              <Suspense fallback={<ChartSkeleton />}>
                <MeasurementBreakdownSection cityId={id} />
              </Suspense>
            ),

            "measurement-trend": (
              <Suspense fallback={<ChartSkeleton />}>
                <MeasurementTrendSection
                  cityId={id}
                  measurementType={measurementType}
                />
              </Suspense>
            ),

            "equipment-status-overview": (
              <Suspense fallback={<TableSkeleton />}>
                <EquipmentOverviewSection
                  cityId={id}
                  plantId={equipmentPlantId}
                />
              </Suspense>
            ),

            "plants-overview": (
              <Suspense fallback={<TableSkeleton />}>
                <PlantsOverviewSection cityId={id} />
              </Suspense>
            ),

            "workshops-overview": (
              <Suspense fallback={<TableSkeleton />}>
                <WorkshopsOverviewSection
                  cityId={id}
                  plantId={workshopPlantId}
                />
              </Suspense>
            ),
          }}
        />
      </div>
    </div>
  );
}

async function StatCardsSection({ cityId }: { cityId: number }) {
  const data = await getCityOverviewCached(cityId);

  if (!data) {
    notFound();
  }

  return <OverviewStatCards cityName={data.city.name} totals={data.totals} />;
}

async function StatusSummarySection({ cityId }: { cityId: number }) {
  const data = await getCityOverviewCached(cityId);

  if (!data) {
    notFound();
  }

  return <StatusSummaryCards statusCounts={data.statusCounts} />;
}

async function EquipmentByPlantSection({ cityId }: { cityId: number }) {
  const data = await getCityOverviewCached(cityId);

  if (!data) {
    notFound();
  }

  return <EquipmentByPlantChart data={data.equipmentByPlant} />;
}

async function EquipmentStatusSection({ cityId }: { cityId: number }) {
  const data = await getCityOverviewCached(cityId);

  if (!data) {
    notFound();
  }

  return <EquipmentStatusChart statusCounts={data.statusCounts} />;
}

async function CitySummarySection({ cityId }: { cityId: number }) {
  const data = await getCityOverviewCached(cityId);

  if (!data) {
    notFound();
  }

  return <CitySummaryTable rows={data.equipmentByPlant} cityId={cityId} />;
}

async function CityAttentionSection({ cityId }: { cityId: number }) {
  const data = await getCityOverviewCached(cityId);

  if (!data) {
    notFound();
  }

  return (
    <CityAttentionCards
      statusCounts={data.statusCounts}
      equipmentByPlant={data.equipmentByPlant}
    />
  );
}

async function StatusHistorySection({
  cityId,
  from,
  to,
}: {
  cityId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);

  const history = await getCityStatusHistory(cityId, {
    from: hasCompleteRange ? new Date(from!) : undefined,
    to: hasCompleteRange ? new Date(to!) : undefined,
    monthsBack: 12,
  });

  return <EquipmentStatusHistoryChart data={history} />;
}

async function InspectionCoverageSection({ cityId }: { cityId: number }) {
  const coverage = await getCityInspectionCoverage(cityId, {
    staleDays: 30,
  });

  return <CityInspectionCoverageCard coverage={coverage} />;
}

async function MeasurementBreakdownSection({ cityId }: { cityId: number }) {
  const data = await getMeasurementTypeBreakdown(cityId);

  return <MeasurementTypeBreakdownChart data={data} />;
}

async function MeasurementTrendSection({
  cityId,
  measurementType,
}: {
  cityId: number;
  measurementType: string;
}) {
  const data = await getMeasurementTrend(
    cityId,
    measurementType as MeasurementType,
  );

  return <MeasurementTrendChart data={data} />;
}

async function EquipmentOverviewSection({
  cityId,
  plantId,
}: {
  cityId: number;
  plantId: number | null;
}) {
  const data = await getEquipmentStatusOverview(cityId, plantId);

  return <EquipmentDataTable data={data} cityId={String(cityId)} />;
}

async function PlantsOverviewSection({ cityId }: { cityId: number }) {
  const data = await getPlantsOverview(cityId);

  return <PlantsOverviewTable data={data} cityId={cityId} />;
}

async function WorkshopsOverviewSection({
  cityId,
  plantId,
}: {
  cityId: number;
  plantId: number | null;
}) {
  const data = await getWorkshopsOverview(cityId, plantId);

  return <WorkshopsOverviewTable data={data} cityId={cityId} />;
}

async function AlarmsOverviewSection({
  cityId,
  plantId,
}: {
  cityId: number;
  plantId: number | null;
}) {
  const data = await getCityAlarmsOverview(cityId, plantId);

  return <AlarmsOverviewTable data={data} />;
}
