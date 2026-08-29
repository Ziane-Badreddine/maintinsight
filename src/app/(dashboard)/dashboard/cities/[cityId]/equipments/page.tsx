import { EquipmentsOverviewLoader } from "@/features/equipments/components/equipments-overview-loader";
import { EquipmentsOverviewSkeleton } from "@/features/equipments/components/equipments-overview-skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipment",
  description: "Browse equipment across plants and workshops.",
  robots: { index: false, follow: false },
};

export default async function EquipmentsPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/equipments">) {
  const { cityId } = await params;

  return (
    <div className="flex flex-col gap-6 ">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Equipment</h1>
        <p className="text-muted-foreground text-sm">
          All equipment across every plant and workshop in this city.
        </p>
      </div>

      <Suspense fallback={<EquipmentsOverviewSkeleton />}>
        <EquipmentsOverviewLoader cityId={Number(cityId)} />
      </Suspense>
    </div>
  );
}
