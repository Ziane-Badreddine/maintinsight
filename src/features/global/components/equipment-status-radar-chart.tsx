// components/dashboard/equipment-status-radar-chart.tsx
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "../constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface EquipmentStatusRadarChartProps {
  statusCounts: Record<EquipmentStatus, number>;
}

const chartConfig: ChartConfig = {
  value: {
    label: "Equipment",
    color: "var(--primary)",
  },
};

export function EquipmentStatusRadarChart({
  statusCounts,
}: EquipmentStatusRadarChartProps) {
  const data = STATUS_DISPLAY_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    value: statusCounts[status],
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status profile</CardTitle>
        <CardDescription>
          Equipment count per status, across all {total} equipment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="value" hideLabel />}
            />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 12 }} />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-value)"
              fillOpacity={0.5}
              stroke="var(--color-value)"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
