// app/(dashboard)/dashboard/cities/[cityId]/plants/[plantId]/inspections/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { loadInspectionHistorySearchParams } from "@/features/inspection/utils/inspection-history";
import {
  getPlantInspections,
  getPlantStatusHistory,
} from "@/features/inspection/actions/plant-inspections";
import { EquipmentStatusTrendChart } from "@/features/inspection/components/equipment-status-trend-chart";
import { InspectionsDataTable } from "@/features/inspection/components/inspections-data-table";

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

export default async function InspectionPage({
  params,
  searchParams,
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]">) {
  const { cityId, plantId } = await params;
  const { from, to } = await loadInspectionHistorySearchParams(searchParams);
  const cId = Number(cityId);
  const pId = Number(plantId);

  if (!Number.isInteger(pId) || pId <= 0) notFound();

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <Suspense fallback={<ChartSkeleton />}>
        <ChartSection plantId={pId} from={from} to={to} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TableSection cityId={cId} plantId={pId} from={from} to={to} />
      </Suspense>
    </div>
  );
}

async function ChartSection({
  plantId,
  from,
  to,
}: {
  plantId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);
  const data = await getPlantStatusHistory(plantId, {
    from: hasCompleteRange ? new Date(from!) : undefined,
    to: hasCompleteRange ? new Date(to!) : undefined,
    monthsBack: 6,
  });

  return <EquipmentStatusTrendChart data={data} />;
}

async function TableSection({
  cityId,
  plantId,
  from,
  to,
}: {
  cityId: number;
  plantId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);
  const data = await getPlantInspections(plantId, {
    from: hasCompleteRange ? new Date(from!) : undefined,
    to: hasCompleteRange ? new Date(to!) : undefined,
  });

  return <InspectionsDataTable data={data} cityId={cityId} plantId={plantId} />;
}
