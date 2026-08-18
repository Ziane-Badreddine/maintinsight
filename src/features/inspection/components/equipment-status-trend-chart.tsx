// features/plant/components/equipment-status-trend-chart.tsx
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "@/features/global/constants/equipment-status";

import type { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";
import { PlantStatusHistoryPoint } from "../actions/plant-inspections";
import { cn } from "@/lib/utils";

const chartConfig = STATUS_DISPLAY_ORDER.reduce((acc, status) => {
  acc[status] = {
    label: STATUS_CONFIG[status].label,
    color: STATUS_CONFIG[status].color,
  };
  return acc;
}, {} as ChartConfig);

interface EquipmentStatusTrendChartProps {
  data: PlantStatusHistoryPoint[];
}

export function EquipmentStatusTrendChart({
  data,
}: EquipmentStatusTrendChartProps) {
  const [activeStatus, setActiveStatus] = React.useState<EquipmentStatus>(
    STATUS_DISPLAY_ORDER[0],
  );

  const totals = React.useMemo(() => {
    return STATUS_DISPLAY_ORDER.reduce(
      (acc, status) => {
        acc[status] = data.reduce(
          (sum, point) => sum + point.statusCounts[status],
          0,
        );
        return acc;
      },
      {} as Record<EquipmentStatus, number>,
    );
  }, [data]);

  const chartData = data.map((point) => ({
    date: point.date,
    label: point.label,
    ...point.statusCounts,
  }));

  return (
    <Card className="gap-0 pt-0">
      {/* <CardHeader className="flex flex-col items-stretch  sm:flex-row pt-4 border-b bg-muted">
        <div className="flex flex-1 flex-col justify-center gap-1  pt-4 pb-3 sm:py-0!">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Equipment status trend</CardTitle>
              <CardDescription>
                Status changes recorded across inspections over time
              </CardDescription>
            </div>
            <InspectionHistoryDateRangePicker />
          </div>
        </div>
      </CardHeader> */}

      <div className="flex overflow-x-auto border-b">
        {STATUS_DISPLAY_ORDER.map((status) => (
          <button
            key={status}
            data-active={activeStatus === status}
            className={cn(
              "relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-6 sm:py-4 data-[active=true]:border-b-3 ",
              `data-[active=true]:border-b-(--status-color)`,
            )}
            style={
              {
                "--status-color": STATUS_CONFIG[status].color,
              } as React.CSSProperties
            }

            onClick={() => setActiveStatus(status)}
          >
            <span className="text-xs text-muted-foreground">
              {STATUS_CONFIG[status].label}
            </span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              {totals[status].toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      <CardContent className="px-2 sm:p-6">
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No inspection data in this period.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                content={<ChartTooltipContent className="w-[150px]" />}
              />
              <Bar
                dataKey={activeStatus}
                fill={STATUS_CONFIG[activeStatus].color}
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
