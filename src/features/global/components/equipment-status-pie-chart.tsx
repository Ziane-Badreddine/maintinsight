// components/dashboard/equipment-status-pie-chart.tsx
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
import { Cell, Pie, PieChart } from "recharts";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "../constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface EquipmentStatusChartProps {
  statusCounts: Record<EquipmentStatus, number>;
}

export function EquipmentStatusChart({
  statusCounts,
}: EquipmentStatusChartProps) {
  const data = STATUS_DISPLAY_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    value: statusCounts[status],
    fill: STATUS_CONFIG[status].color,
  })).filter((d) => d.value > 0);

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d) => [d.status, { label: d.label, color: d.fill }]),
  );

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Status distribution</CardTitle>
        <CardDescription>
          Current status of the site&apos;s {total} equipment
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="label" hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
