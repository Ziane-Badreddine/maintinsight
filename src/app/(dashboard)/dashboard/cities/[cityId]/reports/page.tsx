import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/features/dashboard/lib/permissions";
import {
  ReportsListSlot,
  ReportsTableSkeleton,
} from "@/features/report/components/reports-list-slot";

export default async function CityReportsPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]">) {
  const session = await getSession();
  if (!hasPermission(session?.user ?? null, { report: ["read"] })) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
        </div>
      </div>

      <Suspense fallback={<ReportsTableSkeleton />}>
        <ReportsListSlot paramsPromise={params} />
      </Suspense>
    </div>
  );
}
