"use client";

import { Pie, PieChart, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { statusChartConfig } from "./chart-config";

interface StatusDonutChartProps {
  statusCounts: Record<string, number>;
}

export function StatusDonutChart({ statusCounts }: StatusDonutChartProps) {
  const data = Object.entries(statusCounts).map(([status, value]) => ({
    status,
    value,
    fill: statusChartConfig[status as keyof typeof statusChartConfig]?.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={statusChartConfig}
          className="mx-auto aspect-square max-h-72"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="status"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
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
