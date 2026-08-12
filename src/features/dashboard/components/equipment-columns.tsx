"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";

import type { DataTableFeatures } from "./data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { format } from "date-fns";
import { Workshop } from "../../../../prisma/generated/prisma/client";

export interface EquipmentRow {
  id: number;
  name: string;
  code: string | null;
  workshop: Workshop;
  status: keyof typeof statusChartConfig;
  diagnosis: string | null;
  lastInspectionDate: Date | null;
}

const columnHelper = createColumnHelper<DataTableFeatures, EquipmentRow>();

// Builds absolute /dashboard/cities/[cityId]/plants/[plantId]/... links,
// preserving cityId/plantId from the current route.
export function EquipmentHighlightLink({
  id,
  segment,
  children,
}: {
  id: number;
  segment: "equipments" | "workshops";
  children: React.ReactNode;
}) {
  const params = useParams<{ cityId: string; plantId: string }>();

  return (
    <Link
      href={{
        pathname: `/dashboard/cities/${params.cityId}/plants/${params.plantId}/${segment}`,
        query: { highlight: id },
      }}
      className="font-medium hover:underline"
    >
      {children}
    </Link>
  );
}

export const equipmentColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Equipment" />
    ),
    cell: ({ row }) => (
      <EquipmentHighlightLink id={row.original.id} segment="equipments">
        {row.original.name}
      </EquipmentHighlightLink>
    ),
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("workshop", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workshop" />
    ),
    cell: ({ row }) => (
      <EquipmentHighlightLink id={row.original.workshop.id} segment="workshops">
        {row.original.workshop.name}
      </EquipmentHighlightLink>
    ),
    enableColumnFilter: false,
    sortFn: "text",
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
    sortFn: "text",
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
        ? format(row.original.lastInspectionDate, "MMMM d, yyyy")
        : "—",
    enableColumnFilter: false,
    sortFn: "datetime",
    sortUndefined: "last",
  }),
]);
