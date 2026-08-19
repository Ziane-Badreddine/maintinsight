"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import { createStatusEqualsFilterFn } from "@/components/common/data-table-filter-fns";
import { statusChartConfig } from "@/features/plant/components/chart-config";

import type { AlarmOverviewRow } from "../server/city-alarms-overview";

const columnHelper = createColumnHelper<DataTableFeatures, AlarmOverviewRow>();

export const alarmColumns = columnHelper.columns([
  columnHelper.accessor("equipmentName", {
    id: "equipmentName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipment" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.equipmentName}</div>
        {row.original.equipmentCode && (
          <div className="text-xs text-muted-foreground">
            {row.original.equipmentCode}
          </div>
        )}
      </div>
    ),
    filterFn: "includesString",
    sortFn: "text",
    enableHiding: false,
  }),
  columnHelper.accessor(
    (row) => `${row.plantName ?? row.plantCode} · ${row.workshopName}`,
    {
      id: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plant / Workshop" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.plantName ?? row.original.plantCode} ·{" "}
          {row.original.workshopName}
        </span>
      ),
      filterFn: "includesString",
      sortFn: "text",
    },
  ),
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
    filterFn: createStatusEqualsFilterFn<DataTableFeatures, AlarmOverviewRow>(),
    sortFn: "text",
  }),
  columnHelper.accessor("diagnosis", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diagnosis" />
    ),
    cell: ({ row }) => (
      <span className="block max-w-[240px] truncate text-sm text-muted-foreground">
        {row.original.diagnosis || "—"}
      </span>
    ),
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("inspectionDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Since" />
    ),
    cell: ({ row }) =>
      new Date(row.original.inspectionDate).toLocaleDateString(),
    enableColumnFilter: false,
    sortFn: "datetime",
  }),
]);
