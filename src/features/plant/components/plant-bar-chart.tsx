// src/features/dashboard/components/plant-bar-chart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { STATUS_DISPLAY_ORDER } from "@/features/global/constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface PlantBarChartProps {
  byPlant: Record<string, Record<string, number>>;
}

export function PlantBarChart({ byPlant }: PlantBarChartProps) {
  const chartData = Object.entries(byPlant).map(([plant, counts]) => ({
    plant,
    ...counts,
  }));

  return (
    <Card className="col-span-2 pt-0">
      <CardHeader className="border-b bg-muted pt-4">
        <CardTitle>Equipment status by plant</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusChartConfig} className="max-h-100 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="plant"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            {/* <YAxis tickLine={false} axisLine={false} /> */}
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend
              content={<ChartLegendContent />}
              itemSorter={(item) =>
                STATUS_DISPLAY_ORDER.indexOf(item.dataKey as EquipmentStatus)
              }
            />
            {STATUS_DISPLAY_ORDER.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="status"
                fill={`var(--color-${status})`}
                radius={0}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
