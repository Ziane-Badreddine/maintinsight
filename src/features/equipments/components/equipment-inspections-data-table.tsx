// features/plant/components/equipment-inspections-data-table.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ClipboardListIcon } from "lucide-react";
import { equipmentInspectionColumns } from "./equipment-inspections-columns";

import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { EquipmentInspectionRow } from "../actions/equipment-detail";

interface EquipmentInspectionsDataTableProps {
  data: EquipmentInspectionRow[];
  cityId: number;
  plantId: number;
}

export function EquipmentInspectionsDataTable({
  data,
  cityId,
  plantId,
}: EquipmentInspectionsDataTableProps) {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "inspectionDate", desc: true },
  ]);

  const table = useTable({
    features,
    data,
    columns: equipmentInspectionColumns,
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
        <h2 className="text-sm font-medium text-muted-foreground">
          Inspection history
        </h2>
        <DataTableViewOptions table={table} />
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardListIcon />
            </EmptyMedia>
            <EmptyTitle>No inspections found</EmptyTitle>
            <EmptyDescription>
              This equipment hasn&apos;t been inspected yet.
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
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/cities/${cityId}/plants/${plantId}/inspections/${row.original.inspectionId}`,
                    )
                  }
                  className="h-11 cursor-pointer hover:bg-muted/50 even:bg-card"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
