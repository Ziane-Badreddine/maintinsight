// features/plant/components/equipment-status-breakdown-chart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";
import { PlantEquipmentStatusOverview } from "../actions/plant-inspections";

const chartConfig = {
  count: { label: "Equipment entries" },
} satisfies ChartConfig;

export function EquipmentStatusBreakdownChart({
  overview,
}: {
  overview: PlantEquipmentStatusOverview;
}) {
  const data = Object.entries(overview.statusCounts)
    .map(([status, count]) => ({
      status,
      label:
        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color,
      count,
    }))
    .filter((d) => d.count > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Equipment status history</CardTitle>
        <p className="text-xs text-muted-foreground">
          Across {overview.totalInspections} inspection campaign
          {overview.totalInspections !== 1 ? "s" : ""} ·{" "}
          {overview.totalEquipmentEntries} equipment readings
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No inspection data recorded yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart data={data} layout="vertical">
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                width={100}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
