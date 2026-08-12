// components/dashboard/status-history-date-range-picker.tsx
"use client";

import { useState, useTransition } from "react";
import { format, parseISO, startOfDay, subDays, subMonths } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStatusHistoryFilters } from "@/features/global/search-params/status-history";

type PresetKey = "today" | "7d" | "30d" | "3m" | "6m" | "12m" | "all";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "3m", label: "Last 3 months" },
  { key: "6m", label: "Last 6 months" },
  { key: "12m", label: "Last 12 months" },
  { key: "all", label: "All" },
];

function presetToRange(key: PresetKey): DateRange | undefined {
  const today = startOfDay(new Date());
  switch (key) {
    case "today":
      return { from: today, to: today };
    case "7d":
      return { from: subDays(today, 6), to: today };
    case "30d":
      return { from: subDays(today, 29), to: today };
    case "3m":
      return { from: subMonths(today, 3), to: today };
    case "6m":
      return { from: subMonths(today, 6), to: today };
    case "12m":
      return { from: subMonths(today, 12), to: today };
    case "all":
      return { from: new Date(2026, 0, 1), to: today };
  }
}

export function StatusHistoryDateRangePicker() {
  const [isPending, startTransition] = useTransition();
  const [{ from, to }, setFilters] = useStatusHistoryFilters({
    startTransition,
  });
  const [openPopover, setOpenPopover] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);

  const committedFrom = from ? parseISO(from) : undefined;
  const committedTo = to ? parseISO(to) : undefined;

  const [draft, setDraft] = useState<DateRange | undefined>(
    committedFrom ? { from: committedFrom, to: committedTo } : undefined,
  );

  const label =
    committedFrom && committedTo
      ? `${format(committedFrom, "MMM d, yyyy")} - ${format(committedTo, "MMM d, yyyy")}`
      : "Last 6 months";

  function commit(range: DateRange | undefined) {
    setFilters({
      from: range?.from ? format(range.from, "yyyy-MM-dd") : null,
      to: range?.to ? format(range.to, "yyyy-MM-dd") : null,
    });
    setOpenPopover(false);
  }

  // Reset local draft state whenever the popover opens, without doing it
  // inside a useEffect (which would trigger an extra render pass / trips
  // react-hooks/set-state-in-effect).
  function handleOpenChange(open: boolean) {
    if (open) {
      setDraft(
        committedFrom ? { from: committedFrom, to: committedTo } : undefined,
      );
      setActivePreset(null);
    }
    setOpenPopover(open);
  }

  function handlePresetClick(key: PresetKey) {
    const range = presetToRange(key);
    setActivePreset(key);
    setDraft(range);
    commit(range);
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    setActivePreset(null);
    setDraft(range);
  }

  return (
    <Popover open={openPopover} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(!committedFrom && "text-muted-foreground")}
          >
            {isPending ? (
              <Loader2 className=" animate-spin" />
            ) : (
              <CalendarIcon className="  " />
            )}
            <span className="truncate">{label}</span>
          </Button>
        }
      ></PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          {/* Preset sidebar */}
          <div className="flex w-42 flex-col gap-0.5 border-r p-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handlePresetClick(preset.key)}
                className={cn(
                  "rounded-md px-3 py-2 text-left text-sm text-foreground/90 transition-colors hover:bg-accent",
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
                defaultMonth={draft?.from ?? committedFrom}
                selected={draft}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                disabled={{ after: new Date() }}
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
                onClick={() => commit(draft)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
