"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const TYPE_LABEL: Record<string, string> = {
  VIBRATION: "Vibration",
  TEMPERATURE: "Temperature",
  ULTRASOUND: "Ultrasound",
  PRESSURE: "Pressure",
  SPEED: "Speed",
  CURRENT: "Current",
  VOLTAGE: "Voltage",
  OTHER: "Other",
};

interface MeasurementTypeBreakdownChartProps {
  data: {
    type: string;
    count: number;
  }[];
}

const chartConfig = {
  count: {
    label: "Measurements",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export function MeasurementTypeBreakdownChart({
  data,
}: MeasurementTypeBreakdownChartProps) {
  const chartData = data.map((item) => ({
    type: item.type,
    label: TYPE_LABEL[item.type] ?? item.type,
    count: item.count,
  }));

  // const totalMeasurements = chartData.reduce(
  //   (total, item) => total + item.count,
  //   0,
  // );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurements by type</CardTitle>
        <CardDescription>
          Distribution of recorded measurements by type
        </CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-center text-sm text-muted-foreground">
              No measurements recorded yet.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                right: 32,
              }}
            >
              <CartesianGrid horizontal={false} />

              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />

              <XAxis dataKey="count" type="number" hide />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.label ?? ""
                    }
                  />
                }
              />

              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                <LabelList
                  dataKey="label"
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label)  font-semibold"
                />

                <LabelList
                  dataKey="count"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>

      {/* {chartData.length > 0 && (
        <div className="px-6 pb-6 text-sm text-muted-foreground">
          {totalMeasurements.toLocaleString()} total measurements
        </div>
      )} */}
    </Card>
  );
}
