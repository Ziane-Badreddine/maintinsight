"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface AdvisorCenterProps {
  plantId?: number;
}

import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface CriticalEquipment {
  id: number;
  name: string;
  workshopName: string;
  status: string;
  recommendation: string | null;
  inspectionDate: string | null;
}

async function fetchCriticalEquipments(
  plantId: number,
): Promise<CriticalEquipment[]> {
  const { data } = await api.get<CriticalEquipment[]>(
    `/plants/${plantId}/critical-equipments`,
  );
  return data;
}

export const criticalEquipmentsQueryOptions = (plantId: number) =>
  queryOptions({
    queryKey: ["critical-equipments", plantId],
    queryFn: () => fetchCriticalEquipments(plantId),
    enabled: plantId > 0,
    staleTime: 60 * 1000,
  });

export function AdvisorCenter({ plantId }: AdvisorCenterProps) {
  const [open, setOpen] = useState(false);

  const { data, isPending } = useQuery({
    ...criticalEquipmentsQueryOptions(plantId ?? 0),
    enabled: Boolean(plantId), // fetch seulement à l'ouverture, pas au montage du header
  });

  const count = data?.length ?? 0;

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          disabled={!plantId}
          onClick={() => setOpen(true)}
          aria-label="Advisor center"
          className={"rounded-full"}
        >
          <LightbulbIcon className="size-4" />
        </Button>
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-destructive-500 dark:bg-destructive"></span>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-screen sm:max-w-2xl! flex flex-col"
        >
          <SheetHeader>
            <SheetTitle>Advisor center</SheetTitle>
            <SheetDescription>
              Critical equipments needing attention
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 pb-4">
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
                    <div
                      key={eq.id}
                      className="rounded-md border p-3 space-y-1"
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
                        {eq.workshopName}
                      </p>
                      {eq.recommendation && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {eq.recommendation}
                        </p>
                      )}
                    </div>
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
