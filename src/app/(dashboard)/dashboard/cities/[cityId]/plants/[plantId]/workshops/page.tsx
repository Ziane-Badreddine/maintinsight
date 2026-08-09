import { Suspense } from "react";

import { prisma } from "@/lib/prisma";
import { WorkshopRow } from "@/features/workshop/components/workshop-columns";
import { WorkshopStatCards } from "@/features/workshop/components/workshop-stat-cards";
import { WorkshopsDataTable } from "@/features/workshop/components/workshops-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default async function WorkshopsPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]/workshops">) {
  const { plantId } = await params;

  return (
    <div className=" space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Workshops</h1>
        <p className="text-muted-foreground text-sm">
          Overview of every workshop&apos;s equipment health
        </p>
      </div>

      <Suspense fallback={<WorkshopsSkeleton />}>
        <WorkshopsLoader plantId={Number(plantId)} />
      </Suspense>
    </div>
  );
}

async function getWorkshopsOverview(plantId: number): Promise<WorkshopRow[]> {
  const workshops = await prisma.workshop.findMany({
    where: { plantId },
    include: {
      equipments: {
        include: {
          inspections: {
            orderBy: { inspection: { inspectionDate: "desc" } },
            take: 1,
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return workshops.map((ws) => {
    const statusCounts: Record<string, number> = {};
    for (const eq of ws.equipments) {
      const status = eq.inspections[0]?.status ?? "NOT_MONITORED";
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    }

    const total = ws.equipments.length;
    const healthy = (statusCounts.GOOD ?? 0) + (statusCounts.ACCEPTABLE ?? 0);
    const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;
    const critical = (statusCounts.ALARM ?? 0) + (statusCounts.ALERT ?? 0);

    return {
      id: ws.id,
      name: ws.name,
      code: ws.code,
      description: ws.description,
      total,
      healthRate,
      critical,
      statusCounts,
    };
  });
}

interface WorkshopsLoaderProps {
  plantId: number;
}

export async function WorkshopsLoader({ plantId }: WorkshopsLoaderProps) {
  const rows = await getWorkshopsOverview(plantId);

  return (
    <>
      <WorkshopStatCards rows={rows} />
      <WorkshopsDataTable data={rows} plantId={plantId} />
    </>
  );
}

export function WorkshopsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <Skeleton className="h-9 w-64" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
