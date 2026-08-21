"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { CircleCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsersFilters } from "./searchParams";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];

export interface StatusOption {
  value: string;
  label: string;
}

export function StatusCombobox() {
  const [isPending, startTransition] = useTransition();
  const anchorRef = useComboboxAnchor();
  const [{ status }, setFilters] = useUsersFilters({
    startTransition,
  });

  const selected =
    STATUS_OPTIONS.find((option) => option.value === status) ?? null;

  return (
    <Combobox<StatusOption>
      items={STATUS_OPTIONS}
      value={selected}
      onValueChange={(option) => {
        if (option)
          setFilters({
            status: option.value,
          });
      }}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <div ref={anchorRef}>
        <ComboboxInput placeholder={"Status"} className={cn("w-full")}>
          <InputGroupAddon>
            {isPending ? <Spinner /> : <CircleCheckIcon />}
          </InputGroupAddon>
        </ComboboxInput>
      </div>

      <ComboboxContent anchor={anchorRef} align="start" side="bottom">
        <ComboboxEmpty>No status found.</ComboboxEmpty>

        <ComboboxList>
          {(item: StatusOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
