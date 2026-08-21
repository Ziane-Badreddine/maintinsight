"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { statusChartConfig } from "@/features/plant/components/chart-config";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import { DataTableFeatures } from "@/features/dashboard/components/data-table-features";

export interface CityWorkshopRow {
  id: number;
  name: string;
  code: string | null;
  plantId: number;
  plantName: string;
  equipmentTotal: number;
  healthRate: number;
  statusCounts: Partial<Record<keyof typeof statusChartConfig, number>>;
}

const columnHelper = createColumnHelper<DataTableFeatures, CityWorkshopRow>();

// function WorkshopLink({
//   plantId,
//   workshopId,
//   children,
// }: {
//   plantId: number;
//   workshopId: number;
//   children: React.ReactNode;
// }) {
//   const params = useParams<{ cityId: string }>();
//   return (
//     <Link
//       href={{
//         pathname: `/dashboard/cities/${params.cityId}/plants/${plantId}/workshops`,
//         query: { highlight: workshopId },
//       }}
//       className="font-medium hover:underline"
//     >
//       {children}
//     </Link>
//   );
// }

function PlantLink({
  plantId,
  children,
}: {
  plantId: number;
  children: React.ReactNode;
}) {
  const params = useParams<{ cityId: string }>();
  return (
    <Link
      href={`/dashboard/cities/${params.cityId}/plants/${plantId}`}
      className="text-muted-foreground text-xs hover:underline"
    >
      {children}
    </Link>
  );
}

function StatusBreakdown({
  statusCounts,
}: {
  statusCounts: CityWorkshopRow["statusCounts"];
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

export function createCityWorkshopColumns() {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workshop" />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.name}
          <div>
            <PlantLink plantId={row.original.plantId}>
              {row.original.plantName}
            </PlantLink>
          </div>
        </div>
      ),
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("plantName", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plant" />
      ),
      cell: ({ row }) => (
        <PlantLink plantId={row.original.plantId}>
          {row.original.plantName}
        </PlantLink>
      ),
      sortFn: "text",
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
    // columnHelper.display({
    //   id: "actions",
    //   cell: ({ row }) => (
    //     <div className="flex justify-end">
    //       <WorkshopLink
    //         plantId={row.original.plantId}
    //         workshopId={row.original.id}
    //       >
    //         <Button variant="ghost" size="icon" className="size-8">
    //           <ChevronRightIcon className="size-4" />
    //         </Button>
    //       </WorkshopLink>
    //     </div>
    //   ),
    //   enableHiding: false,
    //   enableSorting: false,
    //   size: 48,
    // }),
  ]);
}
