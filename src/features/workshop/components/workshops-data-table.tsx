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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { SearchIcon, FactoryIcon, PlusIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import { createWorkshopColumns, type WorkshopRow } from "./workshop-columns";
import { WorkshopFormSheet } from "./workshop-form-sheet";
import { features } from "@/features/dashboard/components/data-table-features";
import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { deleteWorkshop } from "../actions/delete-workshop";
import {
  DataTableAddFilterButton,
  DataTableFilterBar,
  DataTableFilterConfig,
} from "@/components/common/data-table-filter-bar";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface WorkshopsDataTableProps {
  data: WorkshopRow[];
  plantId: number;
}

export function WorkshopsDataTable({ data, plantId }: WorkshopsDataTableProps) {
  const router = useRouter();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "healthRate", desc: false },
  ]);
  const [viewAll, setViewAll] = useState(false);

  // --- edit sheet, piloté par ?edit=<id> ---
  const [editId, setEditId] = useQueryState("highlight", {
    ...parseAsInteger,
    shallow: false,
  });
  const editingWorkshop = useMemo(
    () => (editId != null ? (data.find((w) => w.id === editId) ?? null) : null),
    [editId, data],
  );

  const [deletingWorkshop, setDeletingWorkshop] = useState<WorkshopRow | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>([]);

  const workshopFilters: DataTableFilterConfig[] = [
    { id: "name", label: "Name", type: "text", placeholder: "Enter name" },
    { id: "code", label: "Code", type: "text", placeholder: "Enter code" },
    {
      id: "breakdown",
      label: "Status",
      type: "select",
      options: Object.entries(statusChartConfig).map(([key, config]) => ({
        label: config.label,
        value: key,
      })),
      placeholder: "Select status",
    },
    {
      id: "healthRate",
      label: "Health rate",
      type: "numberRange",
      min: 0,
      max: 100,
    },
  ];

  const availableFilters = workshopFilters.filter(
    (f) => !activeFilterIds.includes(f.id),
  );

  function addFilter(id: string) {
    setActiveFilterIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  async function handleDelete() {
    if (!deletingWorkshop) return;
    setIsDeleting(true);
    const result = await deleteWorkshop(deletingWorkshop.id);
    setIsDeleting(false);
    if (result?.error) {
      toast.add({ type: "error", title: result.error });
      return;
    }
    toast.add({ type: "success", title: "Workshop deleted" });
    setDeletingWorkshop(null);
    router.refresh();
  }

  const columns = useMemo(
    () =>
      createWorkshopColumns({
        onEdit: (workshop) => setEditId(workshop.id),
        onDelete: setDeletingWorkshop,
      }),
    [setEditId],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAll, data.length]);

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <InputGroup className="md:w-64">
            <InputGroupInput
              placeholder="Search workshop…"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <DataTableViewOptions table={table} />
          <DataTableAddFilterButton
            options={availableFilters}
            onSelect={addFilter}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New workshop
          </Button>
        </div>
      </div>

      <DataTableFilterBar
        table={table}
        filters={workshopFilters}
        activeIds={activeFilterIds}
        onActiveIdsChange={setActiveFilterIds}
      />

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
          <ScrollArea
            className={cn(
              "rounded-t-2xl rounded-b-xl outline-4 outline-input/30",
            )}
          >
            <Table>
              <TableHeader className="bg-input/30 h-12 ">
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
                    onDoubleClick={() => setEditId(row.original.id)}
                    className="group/row cursor-pointer select-none "
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
          onOpenChange={(open) => !open && setEditId(null)}
        />
      )}

      {/* --- delete --- */}
      <AlertDialog
        open={Boolean(deletingWorkshop)}
        onOpenChange={(open) => !open && setDeletingWorkshop(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workshop?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all equipment and inspection history
              belonging to this workshop. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant={"destructive"}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
