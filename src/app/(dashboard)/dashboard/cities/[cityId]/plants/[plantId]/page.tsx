import { Button } from "@/components/ui/button";
import { PlantOverviewLoader } from "@/features/plant/components/plant-overview-loader";
import { PlantOverviewSkeleton } from "@/features/plant/components/plant-overview-skeleton";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function PlanPage({
  params,
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]">) {
  const { plantId, cityId } = await params;

  return (
    <div className=" space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="link"
          nativeButton={false}
          render={
            <Link
              href={`/dashboard/cities/${cityId}/plants`}
              className="text-muted-foreground! hover:text-foreground!"
            >
              <ArrowLeftIcon className="size-4" />
              Back to plants
            </Link>
          }
        ></Button>
      </div>
      <Suspense fallback={<PlantOverviewSkeleton />}>
        <PlantOverviewLoader plantId={Number(plantId)} />
      </Suspense>
    </div>
  );
}
