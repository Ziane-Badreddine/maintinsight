// app/(dashboard)/dashboard/cities/[cityId]/inspections/[inspectionId]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { WrenchIcon } from "lucide-react";
import { getInspectionDetail } from "@/features/inspection/actions/inspection-detail";
import { InspectionHeaderCard } from "@/features/inspection/components/inspection-header-card";
import { InspectionEquipmentCard } from "@/features/inspection/components/inspection-equipment-card";
import { InspectionEquipmentSummaryCard } from "@/features/inspection/components/inspection-equipment-summary-card";
import { InspectionActionsToolbar } from "@/features/inspection/components/inspection-actions-toolbar";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/cities/[cityId]/inspections/[inspectionId]">): Promise<Metadata> {
  const { inspectionId } = await params;
  const inspection = await getInspectionDetail(Number(inspectionId));

  if (!inspection) notFound();

  const date = inspection.inspectionDate.toLocaleDateString("en-US");
  const reference = inspection.equipments[0]?.equipment.code ?? inspection.equipments[0]?.equipment.name ?? "Inspection";

  return {
    title: `Inspection ${date} | ${reference}`,
    description: `Results and details of the inspection on ${date}.`,
  };
}

function ToolbarSkeleton() {
  return <Skeleton className="h-9 w-full rounded-lg" />;
}

function HeaderSkeleton() {
  return <Skeleton className="h-32 w-full rounded-2xl" />;
}

function SummarySkeleton() {
  return <Skeleton className="h-56 w-full rounded-2xl" />;
}

function EquipmentListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default async function InspectionDetailPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/inspections/[inspectionId]">) {
  const { cityId, inspectionId } = await params;
  const id = Number(inspectionId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<ToolbarSkeleton />}>
        <ToolbarSection inspectionId={id} cityId={cityId} />
      </Suspense>

      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderSection inspectionId={id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-3">
          <Suspense fallback={<EquipmentListSkeleton />}>
            <EquipmentListSection inspectionId={id} />
          </Suspense>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-18">
          <Suspense fallback={<SummarySkeleton />}>
            <SummarySection inspectionId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ToolbarSection({
  inspectionId,
  cityId,
}: {
  inspectionId: number;
  cityId: string;
}) {
  const inspection = await getInspectionDetail(inspectionId);
  if (!inspection) notFound();

  return <InspectionActionsToolbar inspection={inspection} cityId={cityId} />;
}

async function HeaderSection({ inspectionId }: { inspectionId: number }) {
  const inspection = await getInspectionDetail(inspectionId);
  if (!inspection) notFound();

  return <InspectionHeaderCard inspection={inspection} />;
}

async function SummarySection({ inspectionId }: { inspectionId: number }) {
  const inspection = await getInspectionDetail(inspectionId);
  if (!inspection) notFound();

  return <InspectionEquipmentSummaryCard equipments={inspection.equipments} />;
}

async function EquipmentListSection({
  inspectionId,
}: {
  inspectionId: number;
}) {
  const inspection = await getInspectionDetail(inspectionId);
  if (!inspection) notFound();

  if (inspection.equipments.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WrenchIcon />
          </EmptyMedia>
          <EmptyTitle>No equipment recorded</EmptyTitle>
          <EmptyDescription>
            This inspection doesn&apos;t have any equipment entries yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      {inspection.equipments.map((entry) => (
        <InspectionEquipmentCard key={entry.id} entry={entry} />
      ))}
    </>
  );
}
