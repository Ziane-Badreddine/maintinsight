// features/workshop/components/equipment-columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import { createStatusEqualsFilterFn } from "@/components/common/data-table-filter-fns";

export interface EquipmentRow {
  id: number;
  code: string | null;
  name: string;
  scope: "ENTITY" | "SITE";
  type: string | null;
  status: string;
  lastInspectedAt: Date | null;
}

const columnHelper = createColumnHelper<DataTableFeatures, EquipmentRow>();

export const equipmentColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipment" />
    ),
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
    sortFn: "text",
    enableHiding: false,
  }),
  columnHelper.accessor("type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => row.original.type ?? "—",
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("scope", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scope" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-normal">
        {row.original.scope}
      </Badge>
    ),
    filterFn: createStatusEqualsFilterFn<DataTableFeatures, EquipmentRow>(),
    sortFn: "text",
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const config =
        statusChartConfig[
          row.original.status as keyof typeof statusChartConfig
        ];
      return (
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: config?.color, color: config?.color }}
        >
          {config?.label ?? row.original.status}
        </Badge>
      );
    },
    filterFn: createStatusEqualsFilterFn<DataTableFeatures, EquipmentRow>(),
    sortFn: "text",
  }),
  columnHelper.accessor("lastInspectedAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last inspected" />
    ),
    cell: ({ row }) =>
      row.original.lastInspectedAt
        ? new Date(row.original.lastInspectedAt).toLocaleDateString()
        : "Never",
    enableColumnFilter: false,
    sortFn: "datetime",
  }),
]);
