"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { statusChartConfig } from "./chart-config";

interface WorkshopBarChartProps {
  byWorkshop: Record<string, Record<string, number>>;
}

export function WorkshopBarChart({ byWorkshop }: WorkshopBarChartProps) {
  const data = Object.entries(byWorkshop).map(([workshop, counts]) => ({
    workshop,
    ...counts,
  }));

  const statuses = Object.keys(statusChartConfig) as Array<
    keyof typeof statusChartConfig
  >;

  return (
    <Card>
      <CardHeader>
        <CardTitle>By workshop</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusChartConfig} className="max-h-72 w-full">
          <BarChart data={data} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="workshop"
              type="category"
              width={140}
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {statuses.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="a"
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
