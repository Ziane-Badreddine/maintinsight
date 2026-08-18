"use client";

import { useState } from "react";
import { useQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { api } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

interface CityAdvisorCenterProps {
  cityId?: number;
}

export interface CityCriticalEquipment {
  id: number;
  name: string;
  workshopName: string;
  plantId: number;
  plantName: string;
  status: string;
  recommendation: string | null;
  inspectionDate: string | null;
}

async function fetchCityCriticalEquipments(
  cityId: number,
): Promise<CityCriticalEquipment[]> {
  const { data } = await api.get<CityCriticalEquipment[]>(
    `/cities/${cityId}/critical-equipments`,
  );
  return data;
}

export const cityCriticalEquipmentsQueryOptions = (cityId: number) =>
  queryOptions({
    queryKey: ["city-critical-equipments", cityId],
    queryFn: () => fetchCityCriticalEquipments(cityId),
    enabled: cityId > 0,
    staleTime: 60 * 1000,
  });

export function CityAdvisorCenter({ cityId }: CityAdvisorCenterProps) {
  const [open, setOpen] = useState(false);

  const { data, isPending } = useQuery({
    ...cityCriticalEquipmentsQueryOptions(cityId ?? 0),
    enabled: Boolean(cityId),
  });
  const queryClient = useQueryClient();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen && cityId) {
      queryClient.invalidateQueries({
        queryKey: ["city-critical-equipments", cityId],
      });
    }
  };

  const count = data?.length ?? 0;

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          disabled={!cityId}
          onClick={() => handleOpenChange(true)}
          aria-label="Advisor center"
          className={"rounded-full"}
        >
          {isPending ? <Spinner /> : <LightbulbIcon className="size-4" />}
        </Button>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-3 text-center rounded-full  bg-destructive text-[8px]"></span>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-screen sm:max-w-2xl! flex flex-col gap-0"
        >
          <SheetHeader>
            <SheetTitle>Advisor center</SheetTitle>
            <SheetDescription>
              Critical equipment needing attention across all plants
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 py-4">
              {isPending ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : count === 0 ? (
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <LightbulbIcon />
                    </EmptyMedia>
                    <EmptyTitle>All clear</EmptyTitle>
                    <EmptyDescription>
                      No critical equipment right now.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="space-y-3">
                  {data!.map((eq) => {
                    const config =
                      statusChartConfig[
                        eq.status as keyof typeof statusChartConfig
                      ];
                    return (
                      <Link
                        key={eq.id}
                        href={{
                          pathname: `/dashboard/cities/${cityId}/equipments/${eq.id}`,
                        }}
                        style={
                          {
                            "--status-color": config.color,
                          } as React.CSSProperties
                        }
                        onClick={() => setOpen(false)}
                        className="block rounded-md border p-3 space-y-1 hover:bg-muted/50 bg-linear-to-b from-[color-mix(in_srgb,var(--status-color)_50%,transparent)] via-(--status-color)) to-card hover:outline-4 outline-(--status-color)/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {eq.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0"
                            style={{
                              borderColor: config?.color,
                              color: config?.color,
                            }}
                          >
                            {config?.label ?? eq.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {eq.plantName} · {eq.workshopName}
                        </p>
                        {eq.recommendation && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {eq.recommendation}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
