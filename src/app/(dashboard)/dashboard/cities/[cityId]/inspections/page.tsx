import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { loadInspectionHistorySearchParams } from "@/features/inspection/utils/inspection-history";
import {
  getCityInspections,
  getCityStatusHistory,
} from "@/features/inspection/actions/city-inspections";
import { EquipmentStatusTrendChart } from "@/features/inspection/components/equipment-status-trend-chart";
import { InspectionsDataTable } from "@/features/inspection/components/inspections-data-table";
import { InspectionHistoryDateRangePicker } from "@/features/inspection/components/inspection-history-date-range-picker";

function ChartSkeleton() {
  return <Skeleton className="h-[380px] w-full rounded-xl" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="rounded-xl border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CityInspectionPage({
  params,
  searchParams,
}: PageProps<"/dashboard/cities/[cityId]">) {
  const { cityId } = await params;
  const { from, to } = await loadInspectionHistorySearchParams(searchParams);
  const cId = Number(cityId);

  if (!Number.isInteger(cId) || cId <= 0) notFound();

  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inspections</h1>
          <p className="text-muted-foreground text-sm">
            Inspection history and equipment status trends across all plants in
            this city.
          </p>
        </div>
        <InspectionHistoryDateRangePicker />
      </div>
      <Suspense fallback={<ChartSkeleton />}>
        <ChartSection cityId={cId} from={from} to={to} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TableSection cityId={cId} from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function ChartSection({
  cityId,
  from,
  to,
}: {
  cityId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);
  const data = await getCityStatusHistory(cityId, {
    from: hasCompleteRange ? new Date(from!) : undefined,
    to: hasCompleteRange ? new Date(to!) : undefined,
    monthsBack: 6,
  });

  return <EquipmentStatusTrendChart data={data} />;
}

async function TableSection({
  cityId,
  from,
  to,
}: {
  cityId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);
  const data = await getCityInspections(cityId, {
    from: hasCompleteRange ? new Date(from!) : undefined,
    to: hasCompleteRange ? new Date(to!) : undefined,
  });

  return <InspectionsDataTable data={data} cityId={cityId} />;
}
