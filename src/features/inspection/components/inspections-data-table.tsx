// features/plant/components/inspections-data-table.tsx
"use client";

import { useState } from "react";
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
import { SearchIcon, ClipboardListIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { inspectionColumns } from "./inspections-columns";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlantInspectionRow } from "../actions/plant-inspections";
import { CityInspectionRow } from "@/features/inspection/actions/city-inspections";

type InspectionRow = PlantInspectionRow | CityInspectionRow;

interface InspectionsDataTableProps {
  data: InspectionRow[];
  cityId: number;
  plantId?: number; // absent = contexte city, chaque ligne fournit le sien
}

export function InspectionsDataTable({ data }: InspectionsDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "inspectionDate", desc: true },
  ]);

  const table = useTable({
    features,
    data,
    columns: inspectionColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <InputGroup className="md:w-64">
            <InputGroupInput
              placeholder="Search by reference…"
              value={
                (table.getColumn("reference")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("reference")?.setFilterValue(e.target.value)
              }
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <DataTableViewOptions table={table} />
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No inspections found</EmptyTitle>
            <EmptyDescription>
              No inspection campaigns have been recorded yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea className="rounded-t-2xl rounded-b-xl outline-4 outline-input/30 w-full">
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
            <TableBody className="tabular-nums">
              {rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    className="h-11 cursor-pointer hover:bg-muted/50 "
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
