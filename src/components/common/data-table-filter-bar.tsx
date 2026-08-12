"use client";

import * as React from "react";
import type { Column, RowData, Table } from "@tanstack/react-table";
import { ChevronDownIcon, FilterIcon, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import type { DateRangeValue, NumberRangeValue } from "./data-table-filter-fns";
import { Slider } from "../ui/slider";

export type DataTableFilterType =
  | "text"
  | "boolean"
  | "select"
  | "dateRange"
  | "numberRange";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilterConfig {
  /** must match the column id defined in createXColumns() */
  id: string;
  label: string;
  type: DataTableFilterType;
  /** required for "select", optional for "boolean" (defaults to True/False) */
  options?: DataTableFilterOption[];
  placeholder?: string;

  min?: number;
  max?: number;
  step?: number;
}

const BOOLEAN_OPTIONS: DataTableFilterOption[] = [
  { label: "True", value: "true" },
  { label: "False", value: "false" },
];

// =========================================================================
// Trigger button — put it anywhere (e.g. next to your search input).
// =========================================================================

interface DataTableAddFilterButtonProps {
  options: DataTableFilterConfig[];
  onSelect: (id: string) => void;
}

export function DataTableAddFilterButton({
  options,
  onSelect,
}: DataTableAddFilterButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="outline"
            className={"border-border"}
            disabled={options.length === 0}
          >
            <FilterIcon className="size-4" />
            <span className="sr-only">Add filter</span>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 p-1">
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No column left to filter.
          </div>
        ) : (
          <div className="flex flex-col">
            {options.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onSelect(f.id);
                  setOpen(false);
                }}
                className="flex items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// =========================================================================
// Chips row
// =========================================================================

interface DataTableFilterBarProps<TData extends RowData> {
  table: Table<DataTableFeatures, TData>;
  filters: DataTableFilterConfig[];
  activeIds: string[];
  onActiveIdsChange: (ids: string[]) => void;
}

export function DataTableFilterBar<TData extends RowData>({
  table,
  filters,
  activeIds,
  onActiveIdsChange,
}: DataTableFilterBarProps<TData>) {
  if (activeIds.length === 0) return null;

  const hasActiveValues = activeIds.some(
    (id) => table.getColumn(id)?.getFilterValue() !== undefined,
  );

  function removeFilter(id: string) {
    table.getColumn(id)?.setFilterValue(undefined);
    onActiveIdsChange(activeIds.filter((activeId) => activeId !== id));
  }

  function clearAll() {
    activeIds.forEach((id) => table.getColumn(id)?.setFilterValue(undefined));
    onActiveIdsChange([]);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeIds.map((id) => {
        const config = filters.find((f) => f.id === id);
        if (!config) return null;
        return (
          <FilterChip
            key={id}
            table={table}
            config={config}
            onRemove={() => removeFilter(id)}
          />
        );
      })}

      {hasActiveValues && (
        <Button
          variant="link"
          size="sm"
          className="h-6 px-2 text-muted-foreground"
          onClick={clearAll}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

// --- one badge per active filter ------------------------------------------

function FilterChip<TData extends RowData>({
  table,
  config,
  onRemove,
}: {
  table: Table<DataTableFeatures, TData>;
  config: DataTableFilterConfig;
  onRemove: () => void;
}) {
  const column = table.getColumn(config.id);
  const [open, setOpen] = React.useState(false);
  if (!column) return null;

  const hasValue = column.getFilterValue() !== undefined;
  const valueLabel = getValueLabel(config, column);

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-0 rounded-full pr-1 pl-1 text-sm font-normal border-2 border-dotted",
        hasValue && "border-primary/40 bg-primary/10",
      )}
    >
      <button
        type="button"
        onClick={onRemove}
        className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <XCircleIcon
          className={cn(
            "size-3.5",
            hasValue ? "text-primary" : "text-foreground",
          )}
        />
      </button>

      <span
        className={cn(
          "pr-1 font-medium text-xs",
          hasValue ? "text-primary" : "text-foreground",
        )}
      >
        {config.label}
      </span>

      <span className="h-4 w-px bg-border mx-1" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-6 items-center gap-1 rounded-full px-2 hover:bg-muted text-xs",
                hasValue ? "text-primary" : "text-muted-foreground",
              )}
            >
              {valueLabel}
              <ChevronDownIcon className="size-3.5" />
            </button>
          }
        />
        <PopoverContent
          align="start"
          className={cn(config.type === "dateRange" ? "w-auto p-0" : undefined)}
        >
          <FilterEditor
            config={config}
            column={column}
            onDone={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </Badge>
  );
}

function getValueLabel<TData extends RowData>(
  config: DataTableFilterConfig,
  column: Column<DataTableFeatures, TData, unknown>,
): string {
  const raw = column.getFilterValue();

  if (config.type === "numberRange") {
    const range = raw as NumberRangeValue | undefined;
    if (!range || (range.min === undefined && range.max === undefined)) {
      return "Select value";
    }
    const min = range.min ?? "…";
    const max = range.max ?? "…";
    return `${min} – ${max}`;
  }

  if (config.type === "dateRange") {
    const range = raw as DateRangeValue | undefined;
    if (!range || (!range.from && !range.to)) return "Select value";
    if (range.from && range.to) {
      return `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`;
    }
    if (range.from) return format(range.from, "LLL dd, y");
    return "Select value";
  }

  if (config.type === "select" || config.type === "boolean") {
    const options =
      config.options ?? (config.type === "boolean" ? BOOLEAN_OPTIONS : []);
    const found = options.find((o) => o.value === raw);
    return found?.label ?? "Select value";
  }

  return typeof raw === "string" && raw.length > 0 ? raw : "Enter value";
}

// --- shared header + footer shell for every editor -------------------------

function FilterEditorShell({
  label,
  onCancel,
  onApply,
  children,
}: {
  label: string;
  onCancel: () => void;
  onApply: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Filter by {label}</p>
      {children}
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}

// --- popup content, per filter type ---------------------------------------

function FilterEditor<TData extends RowData>({
  config,
  column,
  onDone,
}: {
  config: DataTableFilterConfig;
  column: Column<DataTableFeatures, TData, unknown>;
  onDone: () => void;
}) {
  if (config.type === "text") {
    return <TextEditor column={column} label={config.label} onDone={onDone} />;
  }
  if (config.type === "boolean") {
    return (
      <ComboboxOptionEditor
        column={column}
        label={config.label}
        options={config.options ?? BOOLEAN_OPTIONS}
        onDone={onDone}
      />
    );
  }
  if (config.type === "select") {
    return (
      <ComboboxOptionEditor
        column={column}
        label={config.label}
        options={config.options ?? []}
        onDone={onDone}
      />
    );
  }
  if (config.type === "numberRange") {
    return (
      <NumberRangeEditor
        column={column}
        label={config.label}
        min={config.min}
        max={config.max}
        step={config.step}
        onDone={onDone}
      />
    );
  }
  return (
    <DateRangeEditor column={column} label={config.label} onDone={onDone} />
  );
}

// --- text ------------------------------------------------------------------

function TextEditor<TData extends RowData>({
  column,
  label,
  onDone,
}: {
  column: Column<DataTableFeatures, TData, unknown>;
  label: string;
  onDone: () => void;
}) {
  const committed = (column.getFilterValue() as string | undefined) ?? "";

  const [prevCommitted, setPrevCommitted] = React.useState(committed);
  const [draft, setDraft] = React.useState(committed);
  if (committed !== prevCommitted) {
    setPrevCommitted(committed);
    setDraft(committed);
  }

  function apply() {
    column.setFilterValue(draft || undefined);
    onDone();
  }

  function cancel() {
    setDraft(committed);
    onDone();
  }

  return (
    <FilterEditorShell label={label} onCancel={cancel} onApply={apply}>
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
          if (e.key === "Escape") cancel();
        }}
      />
    </FilterEditorShell>
  );
}
// --- select / boolean — via Combobox ----------------------------------------

function ComboboxOptionEditor<TData extends RowData>({
  column,
  label,
  options,
  onDone,
}: {
  column: Column<DataTableFeatures, TData, unknown>;
  label: string;
  options: DataTableFilterOption[];
  onDone: () => void;
}) {
  const committedValue = column.getFilterValue() as string | undefined;
  const committedOption =
    options.find((o) => o.value === committedValue) ?? null;

  const [prevCommitted, setPrevCommitted] = React.useState(committedValue);
  const [draft, setDraft] = React.useState<DataTableFilterOption | null>(
    committedOption,
  );
  if (committedValue !== prevCommitted) {
    setPrevCommitted(committedValue);
    setDraft(committedOption);
  }

  function apply() {
    column.setFilterValue(draft ? draft.value : undefined);
    onDone();
  }

  function cancel() {
    setDraft(committedOption);
    onDone();
  }

  return (
    <FilterEditorShell label={label} onCancel={cancel} onApply={apply}>
      <Combobox
        items={options}
        itemToStringValue={(item) => item.label}
        value={draft}
        onValueChange={setDraft}
      >
        <ComboboxInput autoFocus placeholder="Search…" />
        <ComboboxContent>
          <ComboboxEmpty>No result.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FilterEditorShell>
  );
}
// --- date range — via Calendar range picker ----------------------------------

function DateRangeEditor<TData extends RowData>({
  column,
  label,
  onDone,
}: {
  column: Column<DataTableFeatures, TData, unknown>;
  label: string;
  onDone: () => void;
}) {
  const raw = column.getFilterValue() as DateRangeValue | undefined;
  const rawRange: DateRange | undefined = raw?.from
    ? { from: raw.from, to: raw.to }
    : undefined;

  const [prevRaw, setPrevRaw] = React.useState(raw);
  const [draft, setDraft] = React.useState<DateRange | undefined>(rawRange);
  if (raw !== prevRaw) {
    setPrevRaw(raw);
    setDraft(rawRange);
  }

  function apply() {
    const hasValue = draft?.from || draft?.to;
    column.setFilterValue(
      hasValue ? { from: draft?.from, to: draft?.to } : undefined,
    );
    onDone();
  }

  function cancel() {
    setDraft(rawRange);
    onDone();
  }

  return (
    <div>
      <p className="px-3 pt-3 text-sm font-medium">Filter by {label}</p>
      <Calendar
        mode="range"
        defaultMonth={draft?.from}
        selected={draft}
        onSelect={setDraft}
        numberOfMonths={2}
      />
      <div className="flex justify-end gap-2 border-t p-2">
        <Button size="sm" variant="secondary" onClick={cancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={apply}>
          Apply
        </Button>
      </div>
    </div>
  );
}

// --- number range --------------------------------------------------------------

function NumberRangeEditor<TData extends RowData>({
  column,
  label,
  min = 0,
  max = 100,
  step = 1,
  onDone,
}: {
  column: Column<DataTableFeatures, TData, unknown>;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  onDone: () => void;
}) {
  const raw = column.getFilterValue() as NumberRangeValue | undefined;
  const rawTuple: [number, number] = [raw?.min ?? min, raw?.max ?? max];

  const [prevRaw, setPrevRaw] = React.useState(raw);
  const [draft, setDraft] = React.useState<[number, number]>(rawTuple);
  if (raw !== prevRaw) {
    setPrevRaw(raw);
    setDraft(rawTuple);
  }

  function apply() {
    const hasValue = draft[0] !== min || draft[1] !== max;
    column.setFilterValue(
      hasValue ? { min: draft[0], max: draft[1] } : undefined,
    );
    onDone();
  }

  function cancel() {
    setDraft(rawTuple);
    onDone();
  }

  return (
    <FilterEditorShell label={label} onCancel={cancel} onApply={apply}>
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm text-muted-foreground">
          {draft[0]} – {draft[1]}
        </span>
      </div>
      <Slider
        value={draft}
        min={min}
        max={max}
        step={step}
        onValueChange={(value) => setDraft(value as [number, number])}
        className="mx-auto w-full"
      />
    </FilterEditorShell>
  );
}
