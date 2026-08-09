"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { FactoryIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { Plant } from "../../../../prisma/generated/prisma/client";
import { plantsByCityQueryOptions } from "@/features/plant/utils/api";

interface PlantSwitcherHeaderProps {
  cityId: string;
  plantId: string;
}

export function PlantSwitcherHeader({
  cityId,
  plantId,
}: PlantSwitcherHeaderProps) {
  const pathname = usePathname();
  const { data: plants, isPending } = useQuery(
    plantsByCityQueryOptions(cityId),
  );

  if (isPending) {
    return <Skeleton className="h-8 w-36" />;
  }

  const activePlant = plants?.find((p) => String(p.id) === plantId);

  // Garde tout ce qui suit "/plants/{plantId}" (ex: "/equipments") pour le réappliquer au nouveau plant
  const suffix = pathname.split(`/plants/${plantId}`)[1] ?? "";

  function buildHref(targetPlantId: number) {
    return `/dashboard/cities/${cityId}/plants/${targetPlantId}${suffix}` as Route;
  }

  return (
    <Combobox
      items={plants ?? []}
      value={activePlant}
      itemToStringValue={(p) => p.name ?? p.code}
      filter={null}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 px-2 gap-1.5 font-medium max-w-40"
          >
            <FactoryIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {activePlant?.name ?? activePlant?.code ?? "Select plant"}
            </span>
            <ChevronsUpDownIcon className="size-3.5 opacity-50 shrink-0" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxEmpty>No plant found.</ComboboxEmpty>
        <ComboboxList>
          {(plant: Plant) => (
            <ComboboxItem
              key={plant.id}
              value={plant}
              className="cursor-pointer"
              render={<Link href={buildHref(plant.id)} />}
            >
              {plant.name ?? plant.code}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
