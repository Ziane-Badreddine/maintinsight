// components/dashboard/equipment-by-workshop-chart.tsx
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

interface EquipmentByWorkshopChartProps {
  data: {
    workshopId: number;
    workshopName: string;
    plantCode: string;
    total: number;
    statusCounts: Record<EquipmentStatus, number>;
  }[];
}

const chartConfig: ChartConfig = STATUS_DISPLAY_ORDER.reduce((acc, status) => {
  acc[status] = {
    label: STATUS_CONFIG[status].label,
    color: STATUS_CONFIG[status].color,
  };
  return acc;
}, {} as ChartConfig);

export function EquipmentByWorkshopChart({
  data,
}: EquipmentByWorkshopChartProps) {
  const top = data.slice(0, 8).map((d) => ({
    name: d.workshopName,
    plant: d.plantCode,
    total: d.total,
    ...d.statusCounts,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Equipment by workshop</CardTitle>
        <CardDescription>
          Top {top.length} workshops, broken down by current equipment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-70 w-full">
          <BarChart data={top} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    `${payload?.[0]?.payload?.name} (${payload?.[0]?.payload?.plant})`
                  }
                />
              }
            />
            {STATUS_DISPLAY_ORDER.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="status"
                fill={`var(--color-${status})`}
                radius={
                  status === STATUS_DISPLAY_ORDER[0]
                    ? [4, 0, 0, 4]
                    : status ===
                        STATUS_DISPLAY_ORDER[STATUS_DISPLAY_ORDER.length - 1]
                      ? [0, 4, 4, 0]
                      : 0
                }
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
