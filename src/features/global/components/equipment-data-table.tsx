"use client";

import { useState, useTransition } from "react";
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Building2, ChevronRight, WrenchIcon } from "lucide-react";
import { equipmentColumns, type EquipmentRow } from "./equipment-columns";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchPlantsByCity } from "@/features/plant/utils/api";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Plant } from "../../../../prisma/generated/prisma/client";
import { useEquipmentStatusOverviewFilters } from "../search-params/equipment-status-overview";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

interface EquipmentDataTableProps {
  data: EquipmentRow[];
  cityId: string;
}

export function EquipmentDataTable({ data, cityId }: EquipmentDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const anchorRef = useComboboxAnchor();

  const table = useTable({
    features,
    data,
    columns: equipmentColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  const { data: plants = [] } = useQuery({
    queryKey: ["plants", cityId],
    queryFn: () => fetchPlantsByCity(cityId),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(cityId),
  });
  const [isPending, startTransition] = useTransition();
  const [{ equipmentPlantId }, setPlantId] = useEquipmentStatusOverviewFilters({
    startTransition,
  });

  const rows = table.getRowModel().rows;
  const selectedPlant =
    plants.find((plant) => plant.id === equipmentPlantId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>No equipment found</EmptyTitle>
            <EmptyDescription>Try a different search term.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea
          className={cn(
            "rounded-t-2xl rounded-b-xl outline-4 outline-input/30 w-[calc(100svw-46px)]",
          )}
        >
          <Table>
            <TableHeader className="bg-input/30 h-12">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="h-11 ">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between gap-4 px-5 border-t bg-muted/50 py-4">
            <h2 className="text-base font-semibold text-muted-foreground ">
              Overview of the equipment with the highest activity
            </h2>

            <div className="flex items-center gap-2">
              <Combobox<Plant>
                items={plants}
                value={selectedPlant}
                onValueChange={(plant) => {
                  setPlantId({
                    equipmentPlantId: plant?.id ?? null,
                  });
                }}
                itemToStringLabel={(item) => item.code}
                itemToStringValue={(item) => String(item.id)}
                isItemEqualToValue={(a, b) => a.id === b.id}
              >
                <div ref={anchorRef}>
                  <ComboboxInput
                    placeholder="Select a plant"
                    disabled={isPending}
                  >
                    <InputGroupAddon>
                      {isPending ? <Spinner /> : <Building2 />}
                    </InputGroupAddon>
                  </ComboboxInput>
                </div>

                <ComboboxContent anchor={anchorRef} align="start" side="bottom">
                  <ComboboxEmpty>No plants found.</ComboboxEmpty>

                  <ComboboxList>
                    {(item: Plant) => (
                      <ComboboxItem key={item.id} value={item}>
                        {item.code}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <DataTableViewOptions table={table} />
              {equipmentPlantId && (
                <Link
                  href={`/dashboard/cities/${cityId}/plants/${equipmentPlantId}`}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Button>
                    View all <ChevronRight />
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
