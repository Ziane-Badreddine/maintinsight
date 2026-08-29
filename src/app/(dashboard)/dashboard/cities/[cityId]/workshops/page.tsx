import { WorkshopsOverviewLoader } from "@/features/workshop/components/workshops-overview-loader";
import { WorkshopsOverviewSkeleton } from "@/features/workshop/components/workshops-overview-skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Browse workshops and maintenance activity.",
  robots: { index: false, follow: false },
};

export default async function WorkshopsPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/workshops">) {
  const { cityId } = await params;

  return (
    <div className="flex flex-col gap-6 ">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workshops</h1>
        <p className="text-muted-foreground text-sm">
          Equipment health overview across all workshops in this city.
        </p>
      </div>

      <Suspense fallback={<WorkshopsOverviewSkeleton />}>
        <WorkshopsOverviewLoader cityId={Number(cityId)} />
      </Suspense>
    </div>
  );
}
