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
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { STATUS_DISPLAY_ORDER } from "@/features/global/constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface EquipmentStatusBarChartProps {
  statusCounts: Record<string, number>;
}

export function EquipmentStatusBarChart({
  statusCounts,
}: EquipmentStatusBarChartProps) {
  const statuses = Object.keys(statusChartConfig) as Array<
    keyof typeof statusChartConfig
  >;

  // Une seule "ligne" — chaque status devient un dataKey empilé dessus
  const data = [
    {
      name: "Equipment",
      ...statuses.reduce<Record<string, number>>((acc, status) => {
        acc[status] = statusCounts[status] ?? 0;
        return acc;
      }, {}),
    },
  ];

  const total = statuses.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0);

  return (
    <Card className="pt-0">
      <CardHeader className="pt-4 bg-muted border-b">
        <CardTitle>By status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusChartConfig} className="h-24 w-full">
          <BarChart data={data} layout="vertical" barSize={40}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" domain={[0, total]} hide />
            <YAxis dataKey="name" type="category" hide />
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
