"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { WrenchIcon } from "lucide-react";
import { equipmentColumns, type EquipmentRow } from "./equipment-columns";
import { DataTableViewOptions } from "./data-table-view-options";

import { features } from "./data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { Badge } from "@/components/ui/badge";

const STATUS_TABS = [
  { value: "ALL", label: "All", color: "" },
  ...Object.entries(statusChartConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label,
    color: cfg.color,
  })),
];

interface EquipmentDataTableProps {
  data: EquipmentRow[];
}

export function EquipmentDataTable({ data }: EquipmentDataTableProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewAll, setViewAll] = useState(false);

  const table = useTable({
    features,
    data,
    columns: equipmentColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  useEffect(() => {
    table.setPageSize(viewAll ? data.length || 1 : 10);
  }, [viewAll, data.length]);

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    table
      .getColumn("status")
      ?.setFilterValue(value === "ALL" ? undefined : value);
  }

  const counts = data.reduce<Record<string, number>>((acc, eq) => {
    acc[eq.status] = (acc[eq.status] ?? 0) + 1;
    return acc;
  }, {});

  const rows = table.getRowModel().rows;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Tabs value={statusFilter} onValueChange={handleStatusChange}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`bg-[${tab.color}]!`}
                style={
                  statusFilter === tab.value && tab.value !== "ALL"
                    ? {
                        backgroundColor: tab.color,
                        color: "white",
                      }
                    : undefined
                }
              >
                {tab.label}
                {tab.value !== "ALL" && (
                  <Badge variant="secondary">{counts[tab.value] ?? 0}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <DataTableViewOptions table={table} />
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>No equipment found</EmptyTitle>
            <EmptyDescription>
              Try a different search term or status filter.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
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
                  <TableRow key={row.id} className="h-11">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {rows.length} of {table.getFilteredRowModel().rows.length}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewAll((v) => !v)}
            >
              {viewAll ? "Show less" : "View all"}
            </Button>
          </div>
        </>
      )}
    </>
  );
}
