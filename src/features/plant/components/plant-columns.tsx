// src/features/dashboard/components/plant-columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";

import { statusChartConfig } from "@/features/plant/components/chart-config";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import { DataTableFeatures } from "@/features/dashboard/components/data-table-features";

export interface PlantRow {
  id: number;
  name: string;
  code: string;
  workshopsCount: number;
  equipmentTotal: number;
  healthRate: number;
  statusCounts: Partial<Record<keyof typeof statusChartConfig, number>>;
}

const columnHelper = createColumnHelper<DataTableFeatures, PlantRow>();

function PlantLink({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) {
  const params = useParams<{ cityId: string }>();
  return (
    <Link
      href={`/dashboard/cities/${params.cityId}/plants/${id}`}
      className="font-medium hover:underline"
    >
      {children}
    </Link>
  );
}

function StatusBreakdown({
  statusCounts,
}: {
  statusCounts: PlantRow["statusCounts"];
}) {
  const entries = Object.entries(statusCounts).filter(([, v]) => v! > 0);
  if (entries.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([status, count]) => {
        const config =
          statusChartConfig[status as keyof typeof statusChartConfig];
        return (
          <Badge
            key={status}
            variant="outline"
            style={{ borderColor: config?.color, color: config?.color }}
            className="text-xs"
          >
            {config?.label ?? status} · {count}
          </Badge>
        );
      })}
    </div>
  );
}

export function createPlantColumns() {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plant" />
      ),
      cell: ({ row }) => (
        <div>
          <PlantLink id={row.original.id}>{row.original.name}</PlantLink>
          <div className="text-xs text-muted-foreground">
            {row.original.code}
          </div>
        </div>
      ),
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("workshopsCount", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workshops" />
      ),
      cell: ({ row }) => row.original.workshopsCount,
      enableColumnFilter: false,
      sortFn: "alphanumeric",
    }),
    columnHelper.accessor("equipmentTotal", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Equipment" />
      ),
      cell: ({ row }) => row.original.equipmentTotal,
      enableColumnFilter: false,
      sortFn: "alphanumeric",
    }),
    columnHelper.accessor("healthRate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Health rate" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 w-32">
          <Progress value={row.original.healthRate} className="h-2" />
          <span className="text-sm text-muted-foreground tabular-nums w-9">
            {row.original.healthRate}%
          </span>
        </div>
      ),
      enableColumnFilter: false,
      sortFn: "alphanumeric",
    }),
    columnHelper.accessor("statusCounts", {
      header: "Status breakdown",
      cell: ({ row }) => (
        <StatusBreakdown statusCounts={row.original.statusCounts} />
      ),
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <PlantLink id={row.original.id}>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronRightIcon className="size-4" />
            </Button>
          </PlantLink>
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
      size: 48,
    }),
  ]);
}
