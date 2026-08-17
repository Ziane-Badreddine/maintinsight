// features/plant/components/equipment-inspections-columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";
import { EquipmentInspectionRow } from "../actions/equipment-detail";

const columnHelper = createColumnHelper<
  DataTableFeatures,
  EquipmentInspectionRow
>();

export const equipmentInspectionColumns = columnHelper.columns([
  columnHelper.accessor("reference", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference" />
    ),
    cell: ({ row }) =>
      row.original.reference ?? `#${row.original.inspectionId}`,
    filterFn: "includesString",
    sortFn: "text",
    enableHiding: false,
  }),
  columnHelper.accessor("inspectionDate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) =>
      new Date(row.original.inspectionDate).toLocaleDateString(),
    sortFn: "datetime",
  }),
  columnHelper.accessor("performedByName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Performed by" />
    ),
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const config = STATUS_CONFIG[row.original.status];
      return (
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: config.color, color: config.color }}
        >
          {config.label}
        </Badge>
      );
    },
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("diagnosis", {
    header: "Diagnosis",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-xs text-muted-foreground">
        {row.original.diagnosis ?? "—"}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("measurementCount", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Measurements" />
    ),
    cell: ({ row }) => <div>{row.original.measurementCount}</div>,
    sortFn: "alphanumeric",
  }),
]);
