"use client";

import Link from "next/link";
import type { Route } from "next";
import { Building2Icon, ChevronsUpDownIcon } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import type { City } from "../../../../prisma/generated/prisma/client";

interface CitySwitcherHeaderProps {
  cityId: string;
  cities: City[];
}

export function CitySwitcherHeader({ cityId, cities }: CitySwitcherHeaderProps) {

  const activeCity = cities?.find((c) => String(c.id) === cityId);

  return (
    <Combobox
      items={cities ?? []}
      value={activeCity}
      itemToStringValue={(c) => c.name}
      filter={null}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 px-2 gap-1.5 font-medium max-w-36"
          >
            <Building2Icon className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {activeCity?.name ?? "Select city"}
            </span>
            <ChevronsUpDownIcon className="size-3.5 opacity-50 shrink-0" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxEmpty>No city found.</ComboboxEmpty>
        <ComboboxList>
          {(city: City) => (
            <ComboboxItem
              key={city.id}
              value={city}
              className="cursor-pointer"
              render={<Link href={`/dashboard/cities/${city.id}` as Route} />}
            >
              {city.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
