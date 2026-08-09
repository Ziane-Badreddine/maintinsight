"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
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

import type { Workshop } from "../../../../prisma/generated/prisma/client";
import { api } from "@/lib/axios";

interface WorkshopSwitcherProps {
  plantId: string;
}

async function fetchWorkshopsByPlant(plantId: string): Promise<Workshop[]> {
  const { data } = await api.get<Workshop[]>(`/plants/${plantId}/workshops`);
  return data;
}

const ALL_OPTION: Pick<Workshop, "id" | "name"> = {
  id: -1,
  name: "All workshops",
};

export function WorkshopSwitcher({ plantId }: WorkshopSwitcherProps) {
  const { data: workshops, isPending } = useQuery({
    queryKey: ["workshops", plantId],
    queryFn: () => fetchWorkshopsByPlant(plantId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(plantId),
  });
  const [workshopFilter, setWorkshopFilter] = useQueryState("workshop", {
    defaultValue: "ALL",
  });

  if (isPending) {
    return <Skeleton className="h-8 w-36" />;
  }

  const items = [ALL_OPTION, ...(workshops ?? [])];
  const selected =
    workshopFilter === "ALL"
      ? ALL_OPTION
      : workshops?.find((w) => String(w.id) === workshopFilter);

  return (
    <Combobox
      items={items}
      value={selected}
      itemToStringValue={(w) => w.name}
      filter={null}
      onValueChange={(w) =>
        setWorkshopFilter(!w || w.id === -1 ? "ALL" : String(w.id))
      }
    >
      <ComboboxTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 px-2 gap-1.5 font-normal max-w-40 text-muted-foreground"
          >
            <FactoryIcon className="size-4 shrink-0" />
            <span className="truncate">
              {selected?.name ?? "All workshops"}
            </span>
            <ChevronsUpDownIcon className="size-3.5 opacity-50 shrink-0" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxEmpty>No workshop found.</ComboboxEmpty>
        <ComboboxList>
          {(workshop: { id: number; name: string }) => (
            <ComboboxItem
              key={workshop.id}
              value={workshop}
              className="cursor-pointer"
            >
              {workshop.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
