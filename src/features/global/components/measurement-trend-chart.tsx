// features/global/components/measurement-trend-chart.tsx
"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  Gauge,
  Thermometer,
  Waves,
  Zap,
  Bolt,
  Radar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMeasurementTrendFilters } from "../search-params/measurement-trend";

interface MeasurementTypeOption {
  value:
    | "VIBRATION"
    | "TEMPERATURE"
    | "ULTRASOUND"
    | "PRESSURE"
    | "SPEED"
    | "CURRENT"
    | "VOLTAGE";
  label: string;
  icon: React.ElementType;
}

const TYPE_OPTIONS: MeasurementTypeOption[] = [
  { value: "VIBRATION", label: "Vibration", icon: Activity },
  { value: "TEMPERATURE", label: "Temperature", icon: Thermometer },
  { value: "ULTRASOUND", label: "Ultrasound", icon: Waves },
  { value: "PRESSURE", label: "Pressure", icon: Gauge },
  { value: "SPEED", label: "Speed", icon: Radar },
  { value: "CURRENT", label: "Current", icon: Zap },
  { value: "VOLTAGE", label: "Voltage", icon: Bolt },
];

interface TrendPoint {
  month: string;
  average: number;
  unit: string | null;
  sampleSize: number;
}

interface MeasurementTrendChartProps {
  data: TrendPoint[];
}

const chartConfig = {
  average: { label: "Average", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function MeasurementTrendChart({ data }: MeasurementTrendChartProps) {
  const [{ measurementType }, setFilters] = useMeasurementTrendFilters();

  const anchorRef = useComboboxAnchor();
  const unit = data[0]?.unit ?? "";

  const selectedType =
    TYPE_OPTIONS.find((opt) => opt.value === measurementType) ??
    TYPE_OPTIONS[0];
  const SelectedIcon = selectedType.icon;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Measurement trend</CardTitle>

        <Combobox<MeasurementTypeOption>
          items={TYPE_OPTIONS}
          value={selectedType}
          onValueChange={(opt) => {
            if (opt) setFilters({ measurementType: opt.value });
          }}
          itemToStringLabel={(item) => item.label}
          itemToStringValue={(item) => item.value}
          isItemEqualToValue={(a, b) => a.value === b.value}
        >
          <div ref={anchorRef}>
            <ComboboxInput placeholder="Select a type" className="w-[160px]">
              <InputGroupAddon>
                <SelectedIcon className="size-4" />
              </InputGroupAddon>
            </ComboboxInput>
          </div>

          <ComboboxContent anchor={anchorRef} align="end" side="bottom">
            <ComboboxEmpty>No measurement types found.</ComboboxEmpty>

            <ComboboxList>
              {(item: MeasurementTypeOption) => (
                <ComboboxItem key={item.value} value={item}>
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {measurementType.toLowerCase()} measurements in the last 6
            months.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                label={{ value: unit, angle: -90, position: "insideLeft" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-average)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
