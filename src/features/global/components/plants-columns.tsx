// features/global/components/plants-columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import Link from "next/link";

export interface PlantRow {
  id: number;
  code: string;
  name: string | null;
  totalEquipment: number;
  healthRate: number;
  critical: number;
  cityId: number;
}

const columnHelper = createColumnHelper<DataTableFeatures, PlantRow>();

export const plantColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plant" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/cities/${row.original.cityId}/plants/${row.original.id}`}
        className="font-medium hover:text-primary hover:underline underline-offset-4"
      >
        <div className="font-medium">
          {row.original.name ?? row.original.code}
        </div>
      </Link>
    ),
    filterFn: "includesString",
    sortFn: "text",
    enableHiding: false,
  }),
  columnHelper.accessor("totalEquipment", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipment" />
    ),
    sortFn: "alphanumeric",
  }),
  columnHelper.accessor("healthRate", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Health rate" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress value={row.original.healthRate} className="w-[50%]" />
        <span className="w-9 text-right text-sm text-muted-foreground">
          {row.original.healthRate}%
        </span>
      </div>
    ),
    sortFn: "alphanumeric",
  }),
  columnHelper.accessor("critical", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Critical" />
    ),
    cell: ({ row }) =>
      row.original.critical > 0 ? (
        <Badge variant="destructive" className=" font-normal">
          {row.original.critical}
        </Badge>
      ) : (
        <span className="text-muted-foreground">0</span>
      ),
    sortFn: "alphanumeric",
  }),
]);
