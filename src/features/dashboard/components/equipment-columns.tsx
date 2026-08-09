"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";

import type { DataTableFeatures } from "./data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";

export interface EquipmentRow {
  id: number;
  name: string;
  code: string | null;
  workshopName: string;
  status: keyof typeof statusChartConfig;
  diagnosis: string | null;
  lastInspectionDate: Date | null;
}

const columnHelper = createColumnHelper<DataTableFeatures, EquipmentRow>();

export const equipmentColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipment" />
    ),
    cell: ({ row }) => (
      <Link
        href={`equipments/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
    filterFn: "includesString",
    sortingFn: "text",
  }),
  columnHelper.accessor("workshopName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workshop" />
    ),
    cell: ({ row }) => (
      <Link
        href={`workshops/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.workshopName}
      </Link>
    ),
    enableColumnFilter: false,
    sortingFn: "text",
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
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
    sortingFn: "text",
  }),
  columnHelper.accessor("diagnosis", {
    header: "Diagnosis",
    cell: ({ row }) => (
      <span className="text-muted-foreground line-clamp-1 max-w-xs block">
        {row.original.diagnosis ?? "—"}
      </span>
    ),
    enableColumnFilter: false,
    enableSorting: false,
  }),
  columnHelper.accessor((row) => row.lastInspectionDate ?? undefined, {
    id: "lastInspectionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last inspection" />
    ),
    cell: ({ row }) =>
      row.original.lastInspectionDate
        ? row.original.lastInspectionDate.toLocaleDateString()
        : "—",
    enableColumnFilter: false,
    sortingFn: "datetime",
    sortUndefined: "last",
  }),
]);
