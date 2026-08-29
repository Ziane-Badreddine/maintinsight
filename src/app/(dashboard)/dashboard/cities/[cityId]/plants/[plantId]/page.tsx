import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PlantOverviewLoader } from "@/features/plant/components/plant-overview-loader";
import { PlantOverviewSkeleton } from "@/features/plant/components/plant-overview-skeleton";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/cities/[cityId]/plants/[plantId]">): Promise<Metadata> {
  const { plantId } = await params;
  const plant = await prisma.plant.findUnique({
    where: { id: Number(plantId) },
    select: { name: true, code: true, city: { select: { name: true } } },
  });

  if (!plant) notFound();

  return {
    title: `${plant.name ?? plant.code} | ${plant.city.name}`,
    description: `Overview of the workshops and equipment at ${plant.name ?? plant.code}.`,
  };
}

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
