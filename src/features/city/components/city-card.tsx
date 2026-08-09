import Link from "next/link";
import { Building2Icon, ChevronRightIcon, FactoryIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { City } from "../../../../prisma/generated/prisma/client";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

interface CityCardProps {
  city: City & {
    _count: { plants: number };
  };
}

export function CityCard({ city }: CityCardProps) {
  return (
    <Link href={`/dashboard/cities/${city.id}`}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <Building2Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{city.name}</div>
            <Badge variant="secondary" className="mt-0.5">
              {city.code}
            </Badge>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <FactoryIcon className="size-3.5" />
            {city._count.plants} usine{city._count.plants > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CitiesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center gap-3">
            <Skeleton className="size-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function getCities(query?: string) {
  return prisma.city.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { code: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { plants: true } },
    },
  });
}

interface CitiesGridProps {
  query?: string;
}

export async function CitiesGrid({ query }: CitiesGridProps) {
  const cities = await getCities(query);

  if (cities.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Building2Icon />
          </EmptyMedia>
          <EmptyTitle>No cities found</EmptyTitle>
          <EmptyDescription>
            {query
              ? `No results for "${query}".`
              : "No cities have been added yet."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cities.map((city) => (
        <CityCard key={city.id} city={city} />
      ))}
    </div>
  );
}
