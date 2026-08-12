import type { FilterFn, RowData, TableFeatures } from "@tanstack/react-table";

export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

export function createDateRangeFilterFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): FilterFn<TFeatures, TData> {
  const filterFn: FilterFn<TFeatures, TData> = (row, columnId, filterValue) => {
    const value = filterValue as DateRangeValue | undefined;
    if (!value || (!value.from && !value.to)) return true;

    const raw = row.getValue(columnId) as string | number | Date;
    const date = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(date.getTime())) return true;

    if (value.from && date < value.from) return false;
    if (value.to) {
      const end = new Date(value.to);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }
    return true;
  };

  filterFn.resolveFilterValue = (value) => value;
  filterFn.autoRemove = (value) => {
    const v = value as DateRangeValue | undefined;
    return !v || (!v.from && !v.to);
  };

  return filterFn;
}

export function createBooleanFilterFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): FilterFn<TFeatures, TData> {
  const filterFn: FilterFn<TFeatures, TData> = (row, columnId, filterValue) => {
    const value = filterValue as string | undefined;
    if (value === undefined || value === "") return true;
    return String(Boolean(row.getValue(columnId))) === value;
  };

  filterFn.autoRemove = (value) => value === undefined || value === "";

  return filterFn;
}

/**
 * Filters a row whose column value is a `Record<string, number>` (status
 * breakdown) by "has at least one unit in this status". filterValue is the
 * status key (e.g. "operational", "critical").
 */
export function createStatusEqualsFilterFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): FilterFn<TFeatures, TData> {
  const filterFn: FilterFn<TFeatures, TData> = (row, columnId, filterValue) => {
    const status = filterValue as string | undefined;
    if (!status) return true;

    const counts = row.getValue(columnId) as Record<string, number> | undefined;
    return Boolean(counts && (counts[status] ?? 0) > 0);
  };

  filterFn.autoRemove = (value) => !value;

  return filterFn;
}

export interface NumberRangeValue {
  min?: number;
  max?: number;
}

export function createNumberRangeFilterFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): FilterFn<TFeatures, TData> {
  const filterFn: FilterFn<TFeatures, TData> = (row, columnId, filterValue) => {
    const value = filterValue as NumberRangeValue | undefined;
    if (!value || (value.min === undefined && value.max === undefined)) {
      return true;
    }

    const raw = row.getValue(columnId);
    const num = typeof raw === "number" ? raw : Number(raw);
    if (Number.isNaN(num)) return true;

    if (value.min !== undefined && num < value.min) return false;
    if (value.max !== undefined && num > value.max) return false;
    return true;
  };

  filterFn.resolveFilterValue = (value) => value;
  filterFn.autoRemove = (value) => {
    const v = value as NumberRangeValue | undefined;
    return !v || (v.min === undefined && v.max === undefined);
  };

  return filterFn;
}
/**
 * Generic strict-equality filter — usable for any primitive column value
 * (numbers, strings, enums…). filterValue is compared with String() so a
 * select option's string value ("3") matches a numeric column value (3).
 */
export function createEqualsFilterFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): FilterFn<TFeatures, TData> {
  const filterFn: FilterFn<TFeatures, TData> = (row, columnId, filterValue) => {
    if (filterValue === undefined || filterValue === "") return true;
    return String(row.getValue(columnId)) === String(filterValue);
  };

  filterFn.autoRemove = (value) => value === undefined || value === "";

  return filterFn;
}
