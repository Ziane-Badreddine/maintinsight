"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SearchIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { EquipmentSearchOption } from "../actions/search-equipment";
import { equipmentSearchQueryOptions } from "../utils/equipment-search";

interface EquipmentPickerComboboxProps {
  excludeIds: number[];
  disabled?: boolean;
  onSelect: (equipment: EquipmentSearchOption) => void;
}

export function EquipmentPickerCombobox({
  excludeIds,
  disabled = false,
  onSelect,
}: EquipmentPickerComboboxProps) {
  const anchorRef = useComboboxAnchor();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const { data: items = [], isFetching } = useQuery(
    equipmentSearchQueryOptions(debouncedQuery, excludeIds),
  );

  function resetInput() {
    setInputValue("");
    setDebouncedQuery("");
  }

  return (
    <Combobox<EquipmentSearchOption>
      items={items}
      value={null}
      inputValue={inputValue}
      filter={null}
      disabled={disabled}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => String(item.id)}
      isItemEqualToValue={(a, b) => a.id === b.id}
      onInputValueChange={(value) => {
        setInputValue(value);
      }}
      onValueChange={(item) => {
        if (item) {
          onSelect(item);
        }
        resetInput();
      }}
    >
      <div ref={anchorRef} className="w-full">
        <ComboboxInput
          className="w-full"
          placeholder="Search equipment by name, code, or workshop…"
          showClear
          disabled={disabled}
        />
      </div>
      <ComboboxContent anchor={anchorRef} align="start" side="bottom">
        {isFetching ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Searching…
          </div>
        ) : (
          <>
            <ComboboxEmpty>
              <span className="flex items-center justify-center gap-2 py-2">
                <SearchIcon className="size-4" />
                No equipment found
              </span>
            </ComboboxEmpty>
            <ComboboxList>
              {(item: EquipmentSearchOption) => (
                <ComboboxItem key={item.id} value={item}>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {[item.code, item.workshopName, item.plantName]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                </ComboboxItem>
              )}
            </ComboboxList>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
