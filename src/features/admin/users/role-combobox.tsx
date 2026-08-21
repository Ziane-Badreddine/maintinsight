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
import { UserShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsersFilters } from "./searchParams";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

const ROLE_OPTIONS: RoleOption[] = [
  { value: "viewer", label: "Viewer" },
  { value: "inspector", label: "Inspector" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const ROLE_FILTER_OPTIONS: RoleOption[] = [
  { value: "all", label: "All roles" },
  ...ROLE_OPTIONS,
];

export interface RoleOption {
  value: string;
  label: string;
}

export function RoleCombobox() {
  const [isPending, startTransition] = useTransition();
  const anchorRef = useComboboxAnchor();
  const [{ role }, setFilters] = useUsersFilters({
    startTransition,
  });

  const selected =
    ROLE_FILTER_OPTIONS.find((option) => option.value === role) ?? null;

  return (
    <Combobox<RoleOption>
      items={ROLE_FILTER_OPTIONS}
      value={selected}
      onValueChange={(option) => {
        if (option)
          setFilters({
            role: option.value,
          });
      }}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <div ref={anchorRef}>
        <ComboboxInput placeholder={"Role"} className={cn("max-w-auto")}>
          <InputGroupAddon>
            {isPending ? <Spinner /> : <UserShieldIcon />}
          </InputGroupAddon>
        </ComboboxInput>
      </div>

      <ComboboxContent anchor={anchorRef} align="start" side="bottom">
        <ComboboxEmpty>No role found.</ComboboxEmpty>

        <ComboboxList>
          {(item: RoleOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
