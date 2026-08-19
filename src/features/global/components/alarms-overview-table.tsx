"use client";

import { useState } from "react";
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";

import { alarmColumns } from "./alarm-columns";
import { AlarmDetailsSheet } from "./alarm-details-sheet";
import type { AlarmOverviewRow } from "../server/city-alarms-overview";
import { STATUS_CONFIG } from "../constants/equipment-status";

interface AlarmsOverviewTableProps {
  data: AlarmOverviewRow[];
}

export function AlarmsOverviewTable({ data }: AlarmsOverviewTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "status", desc: false },
    { id: "inspectionDate", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [selected, setSelected] = useState<AlarmOverviewRow | null>(null);

  const table = useTable({
    features,
    data,
    columns: alarmColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: { sorting, columnFilters, columnVisibility, pagination },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-6">
      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle />
            </EmptyMedia>
            <EmptyTitle>No active alerts or alarms</EmptyTitle>
            <EmptyDescription>
              All equipment is currently within normal status.
            </EmptyDescription>
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
                <TableRow
                  key={row.id}
                  className={cn(
                    "h-11 cursor-pointer",
                    "bg-linear-to-r from-[color-mix(in_srgb,var(--status-color)_18%,transparent)] via-[color-mix(in_srgb,var(--status-color)_6%,transparent)] to-transparent",
                    "hover:from-[color-mix(in_srgb,var(--status-color)_28%,transparent)]",
                    "transition-colors",
                  )}
                  style={
                    {
                      "--status-color":
                        STATUS_CONFIG[row.original.status]?.color ??
                        "transparent",
                    } as React.CSSProperties
                  }
                  onClick={() => setSelected(row.original)}
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

          <div className="flex items-center justify-between gap-4 px-5 border-t bg-muted/50 py-4">
            <h2 className="text-base font-semibold text-muted-foreground">
              Equipment currently in alert or alarm status
            </h2>

            <div className="flex items-center gap-4">
              {table.getPageCount() > 1 && (
                <>
                  {" "}
                  <span className="text-sm text-muted-foreground">
                    Page {table.state.pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"

                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                      <ChevronRight />
                    </Button>
                  </div>
                </>
              )}

              <DataTableViewOptions table={table} />
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <AlarmDetailsSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        alarm={selected}
      />
    </div>
  );
}
