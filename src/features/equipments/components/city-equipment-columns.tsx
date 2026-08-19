"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { statusChartConfig } from "@/features/plant/components/chart-config";
import { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";

export interface CityEquipmentRow {
  id: number;
  name: string;
  code: string | null;
  workshopId: number;
  workshopName: string;
  plantId: number;
  plantName: string;
  status: keyof typeof statusChartConfig;
  diagnosis: string | null;
  lastInspectionDate: Date | null;
}

const columnHelper = createColumnHelper<DataTableFeatures, CityEquipmentRow>();

function EquipmentLink({
  equipmentId,
  children,
}: {
  plantId: number;
  equipmentId: number;
  children: React.ReactNode;
}) {
  const params = useParams<{ cityId: string }>();
  return (
    <Link
      href={{
        pathname: `/dashboard/cities/${params.cityId}/equipments/${equipmentId}`,
      }}
      className="font-medium hover:underline"
    >
      {children}
    </Link>
  );
}

function WorkshopLink({
  plantId,
  workshopId,
  children,
}: {
  plantId: number;
  workshopId: number;
  children: React.ReactNode;
}) {
  const params = useParams<{ cityId: string }>();
  return (
    <Link
      href={{
        pathname: `/dashboard/cities/${params.cityId}/plants/${plantId}/workshops`,
        query: { highlight: workshopId },
      }}
      className="text-muted-foreground  hover:underline"
    >
      {children}
    </Link>
  );
}

export function createCityEquipmentColumns() {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Equipment" />
      ),
      cell: ({ row }) => (
        <div>
          <EquipmentLink
            plantId={row.original.plantId}
            equipmentId={row.original.id}
          >
            {row.original.name}
          </EquipmentLink>
          {row.original.code && (
            <div className=" text-muted-foreground">{row.original.code}</div>
          )}
        </div>
      ),
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("plantName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plant" />
      ),
      cell: ({ row }) => row.original.plantName,
      sortFn: "text",
    }),
    columnHelper.accessor("workshopName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workshop" />
      ),
      cell: ({ row }) => (
        <WorkshopLink
          plantId={row.original.plantId}
          workshopId={row.original.workshopId}
        >
          {row.original.workshopName}
        </WorkshopLink>
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
}
