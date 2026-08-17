"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { format, startOfDay, subDays, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface InspectionStatusPoint {
  date: string; // "yyyy-MM-dd"
  DRAFT: number;
  COMPLETED: number;
  VALIDATED: number;
}

interface InspectionStatusAreaChartProps {
  data: InspectionStatusPoint[];
}

import type { ChartConfig } from "@/components/ui/chart";

export const inspectionStatusChartConfig = {
  count: {
    label: "Inspections",
  },
  DRAFT: {
    label: "Draft",
    color: "var(--chart-3)",
  },
  COMPLETED: {
    label: "Completed",
    color: "var(--chart-2)",
  },
  VALIDATED: {
    label: "Validated",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type PresetKey = "7d" | "30d" | "90d" | "6m" | "12m" | "all";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 3 months" },
  { key: "6m", label: "Last 6 months" },
  { key: "12m", label: "Last 12 months" },
  { key: "all", label: "All time" },
];

function presetToRange(
  key: PresetKey,
  referenceDate: Date,
  earliestDate: Date,
): DateRange {
  const today = startOfDay(referenceDate);
  switch (key) {
    case "7d":
      return { from: subDays(today, 6), to: today };
    case "30d":
      return { from: subDays(today, 29), to: today };
    case "90d":
      return { from: subDays(today, 89), to: today };
    case "6m":
      return { from: subMonths(today, 6), to: today };
    case "12m":
      return { from: subMonths(today, 12), to: today };
    case "all":
      return { from: earliestDate, to: today };
  }
}

export function InspectionStatusAreaChart({
  data,
}: InspectionStatusAreaChartProps) {
  const referenceDate = React.useMemo(
    () => (data.length > 0 ? new Date(data[data.length - 1].date) : new Date()),
    [data],
  );
  const earliestDate = React.useMemo(
    () =>
      data.length > 0 ? new Date(data[0].date) : subDays(referenceDate, 90),
    [data, referenceDate],
  );

  const [committedRange, setCommittedRange] = React.useState<DateRange>(() =>
    presetToRange("90d", referenceDate, earliestDate),
  );
  const [activePreset, setActivePreset] = React.useState<PresetKey | null>(
    "90d",
  );
  const [draft, setDraft] = React.useState<DateRange | undefined>(
    committedRange,
  );
  const [openPopover, setOpenPopover] = React.useState(false);

  const label =
    activePreset && activePreset !== null
      ? PRESETS.find((p) => p.key === activePreset)?.label
      : committedRange.from && committedRange.to
        ? `${format(committedRange.from, "MMM d, yyyy")} - ${format(committedRange.to, "MMM d, yyyy")}`
        : "Select dates";

  const filteredData = React.useMemo(() => {
    if (data.length === 0) return data;
    const { from, to } = committedRange;
    if (!from || !to) return data;

    const start = startOfDay(from);
    const end = startOfDay(to);
    return data.filter((item) => {
      const itemDate = startOfDay(new Date(item.date));
      return itemDate >= start && itemDate <= end;
    });
  }, [data, committedRange]);

  function handleOpenChange(open: boolean) {
    if (open) {
      setDraft(committedRange);
    }
    setOpenPopover(open);
  }

  function handlePresetClick(key: PresetKey) {
    const range = presetToRange(key, referenceDate, earliestDate);
    setActivePreset(key);
    setDraft(range);
    setCommittedRange(range);
    setOpenPopover(false);
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    setActivePreset(null);
    setDraft(range);
  }

  function handleApply() {
    if (draft?.from && draft?.to) {
      setCommittedRange(draft);
    }
    setOpenPopover(false);
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Inspections by status</CardTitle>
          <CardDescription>
            Number of inspections performed over time, by status
          </CardDescription>
        </div>
        <Popover open={openPopover} onOpenChange={handleOpenChange}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="hidden w-[220px] justify-start rounded-lg sm:ml-auto sm:flex"
              >
                <CalendarIcon />
                <span className="truncate">{label}</span>
              </Button>
            }
          ></PopoverTrigger>
          <PopoverContent className="w-auto rounded-xl p-0" align="end">
            <div className="flex">
              {/* Preset sidebar */}
              <div className="flex w-40 flex-col gap-0.5 border-r p-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetClick(preset.key)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-left text-sm text-foreground/90 transition-colors hover:bg-accent",
                      activePreset === preset.key &&
                        "bg-accent font-medium text-foreground",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Calendar + footer */}
              <div className="flex flex-col">
                <div className="max-h-71 min-h-0 flex-1 overflow-y-auto">
                  <Calendar
                    mode="range"
                    defaultMonth={draft?.from ?? committedRange.from}
                    selected={draft}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={1}
                    disabled={{ after: referenceDate }}
                    captionLayout="dropdown"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenPopover(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!draft?.from || !draft?.to}
                    onClick={handleApply}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={inspectionStatusChartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDraft" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-DRAFT)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-DRAFT)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-COMPLETED)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-COMPLETED)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillValidated" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-VALIDATED)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-VALIDATED)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => format(new Date(value), "MMM d")}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    format(new Date(value), "MMM d, yyyy")
                  }
                  indicator="line"
                />
              }
            />
            <Area
              dataKey="VALIDATED"
              type="natural"
              fill="url(#fillValidated)"
              stroke="var(--color-VALIDATED)"
              stackId="a"
            />
            <Area
              dataKey="COMPLETED"
              type="natural"
              fill="url(#fillCompleted)"
              stroke="var(--color-COMPLETED)"
              stackId="a"
            />
            <Area
              dataKey="DRAFT"
              type="natural"
              fill="url(#fillDraft)"
              stroke="var(--color-DRAFT)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
