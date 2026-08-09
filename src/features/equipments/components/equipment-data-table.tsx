"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowSelectionState,
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
import { WorkshopCombobox } from "./workshop-combobox";
import { ChangeStatusDialog } from "./change-status-dialog";
import { EquipmentFormSheet } from "./equipment-form-sheet";
import { EquipmentStatusSummary } from "./equipment-status-summary";

import { DataTableViewOptions } from "@/features/dashboard/components/data-table-view-options";
import { features } from "@/features/dashboard/components/data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { authClient } from "@/lib/auth-client";
import {
  deleteEquipment,
  duplicateEquipment,
} from "../actions/delete-equipment";
import { exportToCsv } from "../utils/export-csv";
import { deleteEquipments } from "../actions/delete-equipments";
import { BulkActionsDropdown } from "./bulk-actions-dropdown";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  ...Object.entries(statusChartConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
];

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

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [workshopFilter, setWorkshopFilter] = useQueryState("workshop", {
    defaultValue: "ALL",
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [createOpen, setCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentRow | null>(
    null,
  );
  const [statusEquipment, setStatusEquipment] = useState<EquipmentRow | null>(
    null,
  );
  const [viewingEquipment, setViewingEquipment] = useState<EquipmentRow | null>(
    null,
  );
  const [deletingEquipment, setDeletingEquipment] =
    useState<EquipmentRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleDuplicate(equipment: EquipmentRow) {
    const result = await duplicateEquipment(equipment.id);
    if (result?.error) {
      toast.add({ type: "error", title: result.error });
      return;
    }
    toast.add({ type: "success", title: "Equipment duplicated" });
    router.refresh();
  }

  function handleExportOne(equipment: EquipmentRow) {
    exportToCsv(`${equipment.name}.csv`, [
      {
        name: equipment.name,
        code: equipment.code ?? "",
        workshop: equipment.workshopName,
        status: equipment.status,
        diagnosis: equipment.diagnosis ?? "",
      },
    ]);
  }

  const columns = useMemo(
    () =>
      createEquipmentColumns({
        onView: setViewingEquipment,
        onEdit: setEditingEquipment,
        onDelete: setDeletingEquipment,
        onDuplicate: handleDuplicate,
        onExport: handleExportOne,
      }),
    [],
  );

  const table = useTable({
    features,
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { columnFilters, columnVisibility, rowSelection },
  });

  useEffect(() => {
    table
      .getColumn("workshopId")
      ?.setFilterValue(
        workshopFilter === "ALL" ? undefined : Number(workshopFilter),
      );
  }, [workshopFilter]);

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
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  async function handleBulkDelete() {
    setIsDeleting(true);
    const ids = selectedRows.map((r) => r.original.id);
    const result = await deleteEquipments(ids);
    setIsDeleting(false);
    if (result?.error) {
      toast.add({ type: "error", title: result.error });
      return;
    }
    toast.add({ type: "success", title: `${ids.length} equipment(s) deleted` });
    setRowSelection({});
    setBulkDeleteOpen(false);
    router.refresh();
  }

  function handleBulkExport() {
    exportToCsv(
      "equipments.csv",
      selectedRows.map((r) => ({
        name: r.original.name,
        code: r.original.code ?? "",
        workshop: r.original.workshopName,
        status: r.original.status,
        diagnosis: r.original.diagnosis ?? "",
      })),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EquipmentStatusSummary data={data} />

      <div className="w-full overflow-x-auto">
        <Tabs value={statusFilter} onValueChange={handleStatusChange}>
          <TabsList className="w-max">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="shrink-0"
              >
                {tab.label}
                {tab.value !== "ALL" && (
                  <span className="ms-1.5 text-xs text-muted-foreground">
                    {counts[tab.value] ?? 0}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2">
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

          {selectedRows.length > 0 && (
            <BulkActionsDropdown
              count={selectedRows.length}
              onDelete={() => setBulkDeleteOpen(true)}
              onExport={handleBulkExport}
            />
          )}
        </div>

        <div className="flex gap-2 items-center">
          <WorkshopCombobox
            workshops={workshops}
            value={workshopFilter}
            onValueChange={setWorkshopFilter}
          />
          <DataTableViewOptions table={table} />
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New equipment
          </Button>
        </div>
      </div>

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
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      // className={cn(`max-w-[${header.getSize()}px]!`)}
                    >
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
                  className="group/row cursor-pointer"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() => setViewingEquipment(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      // className={cn(`max-w-[${cell.column.getSize()}px]!`)}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- forms & dialogs --- */}
      <EquipmentFormSheet
        workshops={workshops}
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultWorkshopId={
          workshopFilter !== "ALL" ? Number(workshopFilter) : undefined
        }
      />

      {editingEquipment && (
        <EquipmentFormSheet
          workshops={workshops}
          equipment={editingEquipment}
          open={Boolean(editingEquipment)}
          onOpenChange={(open) => !open && setEditingEquipment(null)}
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
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- delete bulk --- */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedRows.length} equipment(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete their inspection history. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
