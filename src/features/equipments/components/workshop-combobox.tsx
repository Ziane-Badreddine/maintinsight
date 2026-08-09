"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { FactoryIcon, ChevronsUpDownIcon } from "lucide-react";

interface Workshop {
  id: number;
  name: string;
}

interface WorkshopComboboxProps {
  workshops: Workshop[];
  value: string; // "ALL" ou String(workshopId)
  onValueChange: (value: string) => void;
}

const ALL_OPTION: Workshop = { id: -1, name: "All workshops" };

export function WorkshopCombobox({
  workshops,
  value,
  onValueChange,
}: WorkshopComboboxProps) {
  const items = [ALL_OPTION, ...workshops];
  const selected =
    value === "ALL"
      ? ALL_OPTION
      : workshops.find((w) => String(w.id) === value);

  return (
    <Combobox
      items={items}
      value={selected}
      itemToStringValue={(w) => w.name}
      onValueChange={(w) =>
        onValueChange(w ? (w.id === -1 ? "ALL" : String(w.id)) : "ALL")
      }
      filter={null}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-44 justify-between font-normal"
          >
            <span className="flex items-center gap-2 truncate">
              <FactoryIcon className="size-4 text-muted-foreground shrink-0" />
              {selected?.name ?? "All workshops"}
            </span>
            <ChevronsUpDownIcon className="size-4 opacity-50 shrink-0" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxEmpty>No workshop found.</ComboboxEmpty>
        <ComboboxList>
          {(workshop: Workshop) => (
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
