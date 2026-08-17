// features/plant/components/inspections-columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "@/features/global/constants/equipment-status";
import { PlantInspectionRow } from "../actions/plant-inspections";

const WORKFLOW_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  DRAFT: "outline",
  COMPLETED: "secondary",
  VALIDATED: "default",
};

const columnHelper = createColumnHelper<
  DataTableFeatures,
  PlantInspectionRow
>();

export const inspectionColumns = columnHelper.columns([
  columnHelper.accessor("reference", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference" />
    ),
    cell: ({ row }) => row.original.reference ?? `#${row.original.id}`,
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
  // columnHelper.accessor("performedByName", {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Performed by" />
  //   ),
  //   filterFn: "includesString",
  //   sortFn: "text",
  // }),
  // --- équipement status breakdown : le cœur de la lecture historique ---
  columnHelper.accessor((row) => row.statusBreakdown, {
    id: "statusBreakdown",
    header: "Equipment status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {STATUS_DISPLAY_ORDER.map((status) => {
          const count = row.original.statusBreakdown[status];
          if (!count) return null;
          const config = STATUS_CONFIG[status];
          return (
            <Badge
              key={status}
              variant="outline"
              className="text-xs"
              style={{ borderColor: config.color, color: config.color }}
            >
              {count} {config.label}
            </Badge>
          );
        })}
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workflow" />
    ),
    cell: ({ row }) => (
      <Badge variant={WORKFLOW_VARIANT[row.original.status] ?? "outline"}>
        {row.original.status}
      </Badge>
    ),
    filterFn: "includesString",
    sortFn: "text",
  }),
]);
