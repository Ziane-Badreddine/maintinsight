"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ExpandIcon, Maximize2, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";

export interface WorkshopRow {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  total: number;
  healthRate: number;
  critical: number;
  statusCounts: Record<string, number>;
}

const columnHelper = createColumnHelper<DataTableFeatures, WorkshopRow>();

interface CreateWorkshopColumnsOptions {
  onEdit: (workshop: WorkshopRow) => void;
}

export function createWorkshopColumns({
  onEdit,
}: CreateWorkshopColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workshop" />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
              {row.original.description}
            </div>
          )}
        </div>
      ),
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("code", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => row.original.code ?? "—",
      sortFn: "text",
    }),
    columnHelper.accessor("total", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Equipments" />
      ),
      enableColumnFilter: false,
      sortFn: "alphanumeric",
    }),
    columnHelper.display({
      id: "breakdown",
      header: "Status breakdown",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(row.original.statusCounts).map(([status, count]) => {
            const config =
              statusChartConfig[status as keyof typeof statusChartConfig];
            return (
              <Badge
                key={status}
                variant="outline"
                className="text-xs"
                style={{ borderColor: config?.color, color: config?.color }}
              >
                {count} {config?.label ?? status}
              </Badge>
            );
          })}
        </div>
      ),
    }),
    columnHelper.accessor("healthRate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Health rate" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 w-32">
          <Progress value={row.original.healthRate} className="h-2" />
          <span className="text-sm text-muted-foreground w-9 text-right">
            {row.original.healthRate}%
          </span>
        </div>
      ),
      enableColumnFilter: false,
      sortFn: "alphanumeric",
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity"
          onClick={() => onEdit(row.original)}
        >
          <Maximize2 className="size-4" />
          <span className="sr-only">Edit workshop</span>
        </Button>
      ),
      enableHiding: false,
    }),
  ]);
}
