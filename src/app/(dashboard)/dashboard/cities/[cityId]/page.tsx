import { Suspense } from "react";
import {
  PlantCard,
  PlantsGridSkeleton,
} from "@/features/dashboard/components/plant-card";
import { PlantSearch } from "@/features/plant/components/plant-search";
import { loadPlantsSearchParams } from "@/features/plant/utils/search-params";
import { prisma } from "@/lib/prisma";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { FactoryIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewPlantDialog } from "@/features/plant/components/new-plant-dialog";

async function getPlants(cityId: number, search: string) {
  return prisma.plant.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { workshops: true } },
    },
    where: {
      cityId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
  });
}

interface PlantsGridProps {
  cityId: number;
  search: string;
}

export default async function CityPage({
  params,
  searchParams,
}: PageProps<"/dashboard/cities/[cityId]">) {
  const { cityId } = await params;
  const { search } = await loadPlantsSearchParams(searchParams);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Plants</h1>
          <p className="text-muted-foreground text-sm">
            Select a plant to access its monitoring dashboard
          </p>
        </div>
        <NewPlantDialog cityId={Number(cityId)}>
          <Button>
            <PlusIcon className="size-4" />
            New Plan
          </Button>
        </NewPlantDialog>
      </div>

      <div className="mb-6 max-w-sm">
        <PlantSearch />
      </div>

      <Suspense key={search} fallback={<PlantsGridSkeleton />}>
        <PlantsGrid cityId={Number(cityId)} search={search} />
      </Suspense>
    </div>
  );
}

export async function PlantsGrid({ cityId, search }: PlantsGridProps) {
  const plants = await getPlants(cityId, search);

  if (plants.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FactoryIcon />
          </EmptyMedia>
          <EmptyTitle>No plants found</EmptyTitle>
          <EmptyDescription>
            {search
              ? `No results for "${search}".`
              : "This city has no plants yet."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  );
}
