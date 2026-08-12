// components/dashboard/equipment-by-plant-chart.tsx
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "../constants/equipment-status";

interface EquipmentByPlantChartProps {
  data: {
    plantId: number;
    plantCode: string;
    plantName: string | null;
    total: number;
    statusCounts: Record<EquipmentStatus, number>;
  }[];
}

const chartConfig: ChartConfig = {
  ...STATUS_DISPLAY_ORDER.reduce((acc, status) => {
    acc[status] = {
      label: STATUS_CONFIG[status].label,
      color: STATUS_CONFIG[status].color,
    };
    return acc;
  }, {} as ChartConfig),
};

export function EquipmentByPlantChart({ data }: EquipmentByPlantChartProps) {
  const top = data.slice(0, 8).map((d) => ({
    name: d.plantName ?? d.plantCode,
    code: d.plantCode,
    total: d.total,
    ...d.statusCounts,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Equipment by plant</CardTitle>
        <CardDescription>
          {top.length} plants, broken down by current equipment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-70 w-full">
          <BarChart
            data={top}
            layout="vertical"
            margin={{ left: -75, right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    `${payload?.[0]?.payload?.name} (${payload?.[0]?.payload?.code})`
                  }
                />
              }
            />
            {STATUS_DISPLAY_ORDER.map((status, index) => {
              const isFirst = index === 0;
              const isLast = index === STATUS_DISPLAY_ORDER.length - 1;

              return (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="status"
                  fill={`var(--color-${status})`}
                  radius={isFirst ? [4, 0, 0, 4] : isLast ? [0, 4, 4, 0] : 0}
                />
              );
            })}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
