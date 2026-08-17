"use client";

import { useEffect, useState } from "react";
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
import { FactoryIcon } from "lucide-react";
import { plantColumns, type PlantRow } from "./plants-columns";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PlantsOverviewTableProps {
  data: PlantRow[];
  cityId: number;
}

export function PlantsOverviewTable({
  data,
  cityId,
}: PlantsOverviewTableProps) {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const table = useTable({
    features,
    data,
    columns: plantColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  useEffect(() => {
    table.setPageSize(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-6">
      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FactoryIcon />
            </EmptyMedia>
            <EmptyTitle>No plants found</EmptyTitle>
            <EmptyDescription>
              This city doesn&apos;t have any plants yet.
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
            <TableBody className="tabular-nums">
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/cities/${cityId}/plants/${row.original.id}`,
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
          <div className="flex items-center justify-between gap-4 px-5 border-t bg-muted/50 py-4">
            <h2 className="text-base font-semibold text-muted-foreground ">
              Overview of the plants
            </h2>

            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
