"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
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
import { SearchIcon, WrenchIcon, PlusIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { createEquipmentColumns, type EquipmentRow } from "./equipment-columns";
import { ChangeStatusDialog } from "./change-status-dialog";
import { EquipmentFormSheet } from "./equipment-form-sheet";
import { EquipmentStatusSummary } from "./equipment-status-summary";

import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { features } from "@/features/dashboard/components/data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { authClient } from "@/lib/auth-client";
import { deleteEquipment } from "../actions/delete-equipment";
import {
  DataTableAddFilterButton,
  DataTableFilterBar,
  type DataTableFilterConfig,
} from "@/components/common/data-table-filter-bar";
import { parseAsInteger, useQueryState } from "nuqs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

interface EquipmentDataTableProps {
  data: EquipmentRow[];
  workshops: Array<{ id: number; name: string }>;
}

export function EquipmentDataTable({
  data,
  workshops,
}: EquipmentDataTableProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useQueryState("highlight", {
    ...parseAsInteger,
    shallow: false,
  });
  const editingEquipment = useMemo(
    () => (editId != null ? (data.find((e) => e.id === editId) ?? null) : null),
    [editId, data],
  );
  const [statusEquipment, setStatusEquipment] = useState<EquipmentRow | null>(
    null,
  );

  const [deletingEquipment, setDeletingEquipment] =
    useState<EquipmentRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- filter bar state ---
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>([]);

  const equipmentFilters: DataTableFilterConfig[] = [
    {
      id: "workshopId",
      label: "Workshop",
      type: "select",
      options: workshops.map((w) => ({ label: w.name, value: String(w.id) })),
      placeholder: "Select workshop",
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      options: Object.entries(statusChartConfig).map(([value, cfg]) => ({
        label: cfg.label,
        value,
      })),
      placeholder: "Select status",
    },
    {
      id: "diagnosis",
      label: "Diagnosis",
      type: "text",
      placeholder: "Enter diagnosis",
    },
    {
      id: "lastInspectionDate",
      label: "Last inspection",
      type: "dateRange",
    },
  ];

  const availableFilters = equipmentFilters.filter(
    (f) => !activeFilterIds.includes(f.id),
  );

  function addFilter(id: string) {
    setActiveFilterIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  async function handleDelete() {
    if (!deletingEquipment) return;
    setIsDeleting(true);
    const result = await deleteEquipment(deletingEquipment.id);
    setIsDeleting(false);
    if (result?.error) {
      toast.add({ type: "error", title: result.error });
      return;
    }
    toast.add({ type: "success", title: "Equipment deleted" });
    setDeletingEquipment(null);
    router.refresh();
  }

  const columns = useMemo(
    () =>
      createEquipmentColumns({
        onEdit: (equipment) => setEditId(equipment.id),
        onDelete: setDeletingEquipment,
      }),
    [setEditId],
  );

  const table = useTable({
    features,
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { columnFilters, columnVisibility, sorting, pagination },
  });
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    table.setPageSize(viewAll ? data.length || 1 : 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAll, data.length]);

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-6">
      <EquipmentStatusSummary data={data} />

      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <InputGroup className="w-full md:w-64">
            <InputGroupInput
              placeholder="Search equipment…"
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

        <div className="flex gap-2 items-center">
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New equipment
          </Button>
        </div>
      </div>

      <DataTableFilterBar
        table={table}
        filters={equipmentFilters}
        activeIds={activeFilterIds}
        onActiveIdsChange={setActiveFilterIds}
      />

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WrenchIcon />
            </EmptyMedia>
            <EmptyTitle>No equipment found</EmptyTitle>
            <EmptyDescription>
              Try a different search term, status, or workshop filter.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ScrollArea
            className={cn(
              "rounded-t-2xl rounded-b-xl outline-4 outline-input/30 ",
            )}
          >
            <Table>
              <TableHeader className="bg-input/30 h-12">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
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
                    className="cursor-pointer select-none"
                    onDoubleClick={() => setEditId(row.original.id)}
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

      {/* --- forms & dialogs --- */}
      <EquipmentFormSheet
        workshops={workshops}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editingEquipment && (
        <EquipmentFormSheet
          workshops={workshops}
          equipment={editingEquipment}
          open={Boolean(editingEquipment)}
          onOpenChange={(open) => !open && setEditId(null)}
        />
      )}

      <ChangeStatusDialog
        equipment={statusEquipment}
        performedById={session?.user.id}
        open={Boolean(statusEquipment)}
        onOpenChange={(open) => !open && setStatusEquipment(null)}
      />

      {/* --- delete single --- */}
      <AlertDialog
        open={Boolean(deletingEquipment)}
        onOpenChange={(open) => !open && setDeletingEquipment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete its inspection history. This action cannot
              be undone.
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
