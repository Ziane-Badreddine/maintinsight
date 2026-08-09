import { PlantOverviewLoader } from "@/features/plant/components/plant-overview-loader";
import { PlantOverviewSkeleton } from "@/features/plant/components/plant-overview-skeleton";
import { Suspense } from "react";

export default async function PlanPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]">) {
  const { plantId } = await params;

  return (
    <div className=" space-y-6">
      <Suspense fallback={<PlantOverviewSkeleton />}>
        <PlantOverviewLoader plantId={Number(plantId)} />
      </Suspense>
    </div>
  );
}
