// src/features/dashboard/components/city-equipment-data-table.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useTable,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, WrenchIcon } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import {
  createCityEquipmentColumns,
  type CityEquipmentRow,
} from "./city-equipment-columns";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";

const PAGE_SIZE = 10;

interface CityEquipmentDataTableProps {
  data: CityEquipmentRow[];
}

export function CityEquipmentDataTable({ data }: CityEquipmentDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [viewAll, setViewAll] = useState(false);

  const columns = useMemo(() => createCityEquipmentColumns(), []);

  const table = useTable({
    features,
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { columnFilters, sorting, pagination },
  });

  const rows = table.getRowModel().rows;

  useEffect(() => {
    table.setPageSize(viewAll ? data.length || 1 : PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAll, data.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <InputGroup className="w-full md:w-64">
          <InputGroupInput
            placeholder="Search equipment…"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <DataTableViewOptions table={table} />
      </div>

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
        <>
          <div className="overflow-hidden rounded-t-2xl rounded-b-xl outline-4 outline-input/30">
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
                  <TableRow key={row.id} className="h-12">
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {rows.length} of {table.getFilteredRowModel().rows.length}
            </p>
            <Button variant="outline" onClick={() => setViewAll((v) => !v)}>
              {viewAll ? "Show less" : "View all"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
