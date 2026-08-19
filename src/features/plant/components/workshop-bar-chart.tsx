"use client";

import { Bar, BarChart, XAxis, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { statusChartConfig } from "./chart-config";
import { STATUS_DISPLAY_ORDER } from "@/features/global/constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface WorkshopBarChartProps {
  byWorkshop: Record<string, Record<string, number>>;
}

export function WorkshopBarChart({ byWorkshop }: WorkshopBarChartProps) {
  const data = Object.entries(byWorkshop).map(([workshop, counts]) => ({
    workshop,
    ...counts,
  }));

  return (
    <Card className="col-span-2 pt-0">
      <CardHeader className="border-b bg-muted pt-4">
        <CardTitle>By workshop</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusChartConfig} className="max-h-120 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="workshop"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
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
