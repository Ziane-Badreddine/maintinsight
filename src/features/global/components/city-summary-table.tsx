import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "../constants/equipment-status";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";

interface CitySummaryTableProps {
  rows: {
    plantId: number;
    plantCode: string;
    plantName: string | null;
    workshopCount: number;
    total: number;
    statusCounts: Record<EquipmentStatus, number>;
  }[];
  cityId: number;
}

// Plain presentational summary table (no sorting/filtering/pagination —
// that's what the equipment data table elsewhere in the app is for).
// This one just gives a fast, printable, at-a-glance read of the whole
// city: one row per plant, one column per status.
export function CitySummaryTable({ rows, cityId }: CitySummaryTableProps) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.workshopCount += row.workshopCount;
      acc.total += row.total;
      for (const status of STATUS_DISPLAY_ORDER) {
        acc.statusCounts[status] += row.statusCounts[status];
      }
      return acc;
    },
    {
      workshopCount: 0,
      total: 0,
      statusCounts: STATUS_DISPLAY_ORDER.reduce(
        (acc, status) => {
          acc[status] = 0;
          return acc;
        },
        {} as Record<EquipmentStatus, number>,
      ),
    },
  );

  return (
    <ScrollArea
      className={cn(
        "rounded-t-2xl rounded-b-xl outline-4 outline-input/30 w-[calc(100svw-32px)]  lg:w-[calc(100svw-32px-482.938px-32px)] col-span-2 relative",
      )}
    >
      <div
        className="absolute inset-0 -z-10 rounded-b-xl"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 2px, var(--border) 2px, var(--border) 4px)",
        }}
      />
      <Table className="z-10 bg-background">
        <TableHeader className="bg-input/30 h-12 ">
          <TableRow>
            <TableHead>Plant</TableHead>
            <TableHead className="text-right">Workshops</TableHead>
            <TableHead className="text-right">Equipment</TableHead>
            {STATUS_DISPLAY_ORDER.map((status) => (
              <TableHead
                key={status}
                style={
                  {
                    "--status-color": STATUS_CONFIG[status].color,
                  } as React.CSSProperties
                }
                className={cn(
                  "text-right",
                  `bg-linear-to-b from-[color-mix(in_srgb,var(--status-color)_50%,transparent)] via-(--status-color)) to-card`,
                )}
              >
                {STATUS_CONFIG[status].label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const maxStatusValue = Math.max(
              ...STATUS_DISPLAY_ORDER.map((status) => row.statusCounts[status]),
            );

            return (
              <TableRow key={row.plantId}>
                <TableCell>
                  <Link
                    href={`/dashboard/cities/${cityId}/plants/${row.plantId}`}
                    className="font-medium hover:text-primary hover:underline underline-offset-4"
                  >
                    {row.plantName ?? row.plantCode}
                  </Link>
                </TableCell>

                <TableCell className="text-right">
                  {row.workshopCount}
                </TableCell>

                <TableCell className="text-right">{row.total}</TableCell>

                {STATUS_DISPLAY_ORDER.map((status) => {
                  const value = row.statusCounts[status];

                  const isMax = value > 0 && value === maxStatusValue;

                  return (
                    <TableCell
                      key={status}
                      style={
                        isMax
                          ? ({
                              "--status-color": STATUS_CONFIG[status].color,
                            } as React.CSSProperties)
                          : undefined
                      }
                      className={cn(
                        "text-right tabular-nums",
                        isMax &&
                          "bg-(--status-color)/15 font-semibold text-(--status-color)",
                      )}
                    >
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="bg-card h-12 rounded-4xl ">
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{totals.workshopCount}</TableCell>
            <TableCell className="text-right">{totals.total}</TableCell>
            {STATUS_DISPLAY_ORDER.map((status) => (
              <TableCell key={status} className="text-right font-medium">
                {totals.statusCounts[status]}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
