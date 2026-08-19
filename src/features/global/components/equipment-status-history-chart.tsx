// components/dashboard/equipment-status-history-chart.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { StatusHistoryPoint } from "../server/city-overview";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "../constants/equipment-status";
import { StatusHistoryDateRangePicker } from "./status-history-date-range-picker";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface EquipmentStatusHistoryChartProps {
  data: StatusHistoryPoint[];
}

const chartConfig: ChartConfig = STATUS_DISPLAY_ORDER.reduce((acc, status) => {
  acc[status] = {
    label: STATUS_CONFIG[status].label,
    color: STATUS_CONFIG[status].color,
  };
  return acc;
}, {} as ChartConfig);

export function EquipmentStatusHistoryChart({
  data,
}: EquipmentStatusHistoryChartProps) {
  const chartData = data.map((point) => ({
    label: point.label,
    ...point.statusCounts,
  }));

  // Derived straight from the returned data points, so the description
  // is correct whether it's the default rolling window or a custom range
  // picked from StatusHistoryDateRangePicker — no extra props needed.
  const periodLabel =
    data.length === 0
      ? "No data available"
      : data.length === 1
        ? data[0].label
        : `${data[0].label} - ${data[data.length - 1].label}`;

  return (
    <Card className="col-span-2 pt-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted pt-4">
        <div>
          <CardTitle>Status history</CardTitle>
          <CardDescription>
            Equipment status per inspection campaign, {periodLabel}
          </CardDescription>
        </div>
        <StatusHistoryDateRangePicker />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 12 }}>
            <defs>
              {STATUS_DISPLAY_ORDER.map((status) => (
                <linearGradient
                  key={status}
                  id={`fill-${status}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${status})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${status})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {STATUS_DISPLAY_ORDER.map((status) => (
              <Area
                key={status}
                dataKey={status}
                type="monotone"
                stackId="status"
                stroke={`var(--color-${status})`}
                fill={`url(#fill-${status})`}
              />
            ))}
            <ChartLegend
              content={<ChartLegendContent />}
              itemSorter={(item) =>
                STATUS_DISPLAY_ORDER.indexOf(item.dataKey as EquipmentStatus)
              }
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
