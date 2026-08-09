import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { EquipmentDataTable } from "@/features/equipments/components/equipment-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EquipmentRow } from "@/features/equipments/components/equipment-columns";

export default async function EquipmentsPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]/equipments">) {
  const { plantId } = await params;

  return (
    <div className=" space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Equipments</h1>
        <p className="text-muted-foreground text-sm">
          Monitor the status of every equipment in this plant
        </p>
      </div>

      <Suspense fallback={<EquipmentsSkeleton />}>
        <EquipmentsLoader plantId={Number(plantId)} />
      </Suspense>
    </div>
  );
}

async function getEquipments(plantId: number): Promise<EquipmentRow[]> {
  const equipments = await prisma.equipment.findMany({
    where: { workshop: { plantId } },
    include: {
      workshop: true,
      inspections: {
        orderBy: { inspection: { inspectionDate: "desc" } },
        take: 1,
        include: { inspection: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return equipments.map((eq) => ({
    id: eq.id,
    name: eq.name,
    code: eq.code,
    workshopId: eq.workshopId,
    workshopName: eq.workshop.name,
    status: (eq.inspections[0]?.status ??
      "NOT_MONITORED") as EquipmentRow["status"],
    diagnosis: eq.inspections[0]?.diagnosis ?? null,
    lastInspectionDate: eq.inspections[0]?.inspection.inspectionDate ?? null,
  }));
}

async function getWorkshops(plantId: number) {
  return prisma.workshop.findMany({
    where: { plantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

interface EquipmentsLoaderProps {
  plantId: number;
}

export async function EquipmentsLoader({ plantId }: EquipmentsLoaderProps) {
  const [data, workshops] = await Promise.all([
    getEquipments(plantId),
    getWorkshops(plantId),
  ]);

  return <EquipmentDataTable data={data} workshops={workshops} />;
}

export function EquipmentsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-9 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <div className="rounded-md border p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
