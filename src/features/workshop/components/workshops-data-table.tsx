"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SearchIcon, FactoryIcon, PlusIcon } from "lucide-react";
import { createWorkshopColumns, type WorkshopRow } from "./workshop-columns";
import { WorkshopFormSheet } from "./workshop-form-sheet";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface WorkshopsDataTableProps {
  data: WorkshopRow[];
  plantId: number;
}

export function WorkshopsDataTable({ data, plantId }: WorkshopsDataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "healthRate", desc: false },
  ]);
  const [viewAll, setViewAll] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopRow | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);

  const columns = useMemo(
    () => createWorkshopColumns({ onEdit: setEditingWorkshop }),
    [],
  );

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  useEffect(() => {
    table.setPageSize(viewAll ? data.length || 1 : 10);
  }, [viewAll, data.length]);

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <InputGroup className="md:w-64">
          <InputGroupInput
            placeholder="Search workshop…"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />

          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New workshop
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FactoryIcon />
            </EmptyMedia>
            <EmptyTitle>No workshops found</EmptyTitle>
            <EmptyDescription>Try a different search term.</EmptyDescription>
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
                  <TableRow key={row.id} className="group/row cursor-pointer">
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

      <WorkshopFormSheet
        plantId={plantId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editingWorkshop && (
        <WorkshopFormSheet
          plantId={plantId}
          workshop={editingWorkshop}
          open={Boolean(editingWorkshop)}
          onOpenChange={(open) => !open && setEditingWorkshop(null)}
        />
      )}
    </div>
  );
}
