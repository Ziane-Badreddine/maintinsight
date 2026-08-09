import Link from "next/link";
import { ChevronRightIcon, FactoryIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plant } from "../../../../prisma/generated/prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PlantCardProps {
  plant: Plant & { _count: { workshops: number } };
}

export function PlantCard({ plant }: PlantCardProps) {
  return (
    <Link href={`/dashboard/cities/${plant.cityId}/plants/${plant.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <FactoryIcon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {plant.name ?? plant.code}
            </div>
            <Badge variant="secondary" className="mt-0.5">
              {plant.code}
            </Badge>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
        </CardHeader>
        {plant.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {plant.description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

export function PlantsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-3">
            <Skeleton className="size-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
