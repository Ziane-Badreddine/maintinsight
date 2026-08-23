import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/features/dashboard/lib/permissions";
import { ReportsGrid } from "./reports-grid";
import { Skeleton } from "@/components/ui/skeleton";

export async function ReportsListSlot({
  paramsPromise,
}: {
  paramsPromise: Promise<{ cityId: string }>;
}) {
  const { cityId: cityIdParam } = await paramsPromise;
  const cityId = Number(cityIdParam);

  const [reports, session] = await Promise.all([
    prisma.report.findMany({
      where: { cityId },
      orderBy: { date: "desc" },
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
      take: 60,
    }),

    getSession(),
  ]);

  const canDelete = hasPermission(session?.user ?? null, {
    report: ["delete"],
  });

  return (
    <ReportsGrid
      cityId={cityId}
      canDelete={canDelete}
      reports={reports.map((r) => ({
        id: r.id,
        date: r.date.toISOString(),
        status: r.status,
        trigger: r.trigger,
        blobUrl: r.blobUrl,
        generatedByName: r.generatedBy?.name ?? null,
        emailSentAt: r.emailSentAt ? r.emailSentAt.toISOString() : null,
        error: r.error,
      }))}
    />
  );
}

export function ReportsTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-[160px]" />
        <Skeleton className="h-9 w-[160px]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-24" />

            <div className="mt-2 flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
