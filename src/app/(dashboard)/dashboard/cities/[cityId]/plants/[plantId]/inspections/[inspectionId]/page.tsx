// app/(dashboard)/dashboard/cities/[cityId]/plants/[plantId]/inspections/[inspectionId]/page.tsx
import { Suspense } from "react";
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

function HeaderSkeleton() {
  return <Skeleton className="h-32 w-full rounded-xl" />;
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
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]/inspections/[inspectionId]">) {
  const { inspectionId } = await params;
  const id = Number(inspectionId);

  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderSection inspectionId={id} />
      </Suspense>

      <Suspense fallback={<EquipmentListSkeleton />}>
        <EquipmentListSection inspectionId={id} />
      </Suspense>
    </div>
  );
}

async function HeaderSection({ inspectionId }: { inspectionId: number }) {
  const inspection = await getInspectionDetail(inspectionId);
  if (!inspection) notFound();

  return <InspectionHeaderCard inspection={inspection} />;
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
    <div className="space-y-3">
      {inspection.equipments.map((entry) => (
        <InspectionEquipmentCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
