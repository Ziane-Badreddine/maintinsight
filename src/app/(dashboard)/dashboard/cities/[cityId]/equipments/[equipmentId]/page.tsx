import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { loadInspectionHistorySearchParams } from "@/features/inspection/utils/inspection-history";
import { EquipmentHeaderCard } from "@/features/equipments/components/equipment-header-card";
import { EquipmentActionsToolbar } from "@/features/equipments/components/equipment-actions-toolbar";
import {
  getEquipmentHeaderInfo,
  getEquipmentInspections,
  getEquipmentStatusHistory,
} from "@/features/equipments/actions/equipment-detail";
import { EquipmentStatusHistoryTrendChart } from "@/features/equipments/components/equipment-status-trend-chart";
import { EquipmentInspectionsDataTable } from "@/features/equipments/components/equipment-inspections-data-table";

function ToolbarSkeleton() {
  return <Skeleton className="h-9 w-full rounded-lg" />;
}

function HeaderSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />;
}

function ChartSkeleton() {
  return <Skeleton className="h-95 w-full rounded-xl" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
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

export default async function EquipmentDetailPage({
  params,
  searchParams,
}: PageProps<"/dashboard/cities/[cityId]/equipments/[equipmentId]">) {
  const { cityId, equipmentId } = await params;
  const { from, to } = await loadInspectionHistorySearchParams(searchParams);

  const cId = Number(cityId);
  const eId = Number(equipmentId);

  if (!Number.isInteger(eId) || eId <= 0) notFound();

  // const canReadEquipment = await auth.api.userHasPermission({
  //   headers: await headers(),
  //   body: {
  //     permissions: {
  //       equipment: ["read"],
  //     },
  //   },
  // });
  // if (!canReadEquipment) notFound();

  return (
    <div className="flex flex-col gap-6 ">
      <Suspense fallback={<ToolbarSkeleton />}>
        <ToolbarSection equipmentId={eId} cityId={cityId} />
      </Suspense>

      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderSection equipmentId={eId} />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <ChartSection equipmentId={eId} from={from} to={to} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <TableSection cityId={cId} equipmentId={eId} />
      </Suspense>
    </div>
  );
}

async function ToolbarSection({
  equipmentId,
  cityId,
}: {
  equipmentId: number;
  cityId: string;
}) {
  const equipment = await getEquipmentHeaderInfo(equipmentId);
  if (!equipment) notFound();

  return <EquipmentActionsToolbar equipment={equipment} cityId={cityId} />;
}

async function HeaderSection({ equipmentId }: { equipmentId: number }) {
  const equipment = await getEquipmentHeaderInfo(equipmentId);
  if (!equipment) notFound();

  return <EquipmentHeaderCard equipment={equipment} />;
}

async function ChartSection({
  equipmentId,
  from,
  to,
}: {
  equipmentId: number;
  from: string | null;
  to: string | null;
}) {
  const hasCompleteRange = Boolean(from && to);
  const data = await getEquipmentStatusHistory(equipmentId, {
    from: hasCompleteRange ? new Date(from!) : undefined,
    to: hasCompleteRange ? new Date(to!) : undefined,
    monthsBack: 6,
  });

  return <EquipmentStatusHistoryTrendChart data={data} />;
}

async function TableSection({
  cityId,
  equipmentId,
}: {
  cityId: number;
  equipmentId: number;
}) {
  const data = await getEquipmentInspections(equipmentId);
  return <EquipmentInspectionsDataTable data={data} cityId={cityId} />;
}
