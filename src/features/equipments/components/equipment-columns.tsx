"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  PencilIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  Maximize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";

export interface EquipmentRow {
  id: number;
  name: string;
  code: string | null;
  workshopId: number;
  workshopName: string;
  status: keyof typeof statusChartConfig;
  diagnosis: string | null;
  lastInspectionDate: Date | null;
}

const columnHelper = createColumnHelper<DataTableFeatures, EquipmentRow>();

interface CreateEquipmentColumnsOptions {
  onView: (equipment: EquipmentRow) => void;
  onEdit: (equipment: EquipmentRow) => void;
  onDelete: (equipment: EquipmentRow) => void;
  onDuplicate: (equipment: EquipmentRow) => void;
  onExport: (equipment: EquipmentRow) => void;
}

export function createEquipmentColumns({
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
}: CreateEquipmentColumnsOptions) {
  return columnHelper.columns([
    // --- select + expand (même cellule) ---
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableHiding: false,
      size: 65,
      maxSize: 65,
    }),

    columnHelper.accessor("name", {
      header: "Equipment",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.code && (
            <div className="text-xs text-muted-foreground">
              {row.original.code}
            </div>
          )}
        </div>
      ),
      filterFn: "includesString",
    }),
    columnHelper.accessor("workshopId", {
      header: "Workshop",
      cell: ({ row }) => row.original.workshopName,
      filterFn: "statusEquals",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusChartConfig[status];
        return (
          <Badge
            variant="outline"
            style={{ borderColor: config?.color, color: config?.color }}
          >
            {config?.label ?? status}
          </Badge>
        );
      },
      filterFn: "statusEquals",
    }),
    columnHelper.accessor("diagnosis", {
      header: "Diagnosis",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs block">
          {row.original.diagnosis ?? "—"}
        </span>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("lastInspectionDate", {
      header: "Last inspection",
      cell: ({ row }) =>
        row.original.lastInspectionDate
          ? row.original.lastInspectionDate.toLocaleDateString()
          : "—",
      enableColumnFilter: false,
    }),

    // --- actions dropdown (par ligne) ---
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 data-[state=open]:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <PencilIcon className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(row.original)}>
              <CopyIcon className="size-4" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport(row.original)}>
              <DownloadIcon className="size-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
      size: 48,
    }),
  ]);
}
