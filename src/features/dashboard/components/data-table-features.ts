import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type Row,
  rowSelectionFeature,
  columnSizingFeature,
  columnResizingFeature,
} from "@tanstack/react-table";

// Custom filter: exact match on status, "ALL" (ou vide) = pas de filtre
function filterFn_statusEquals<TFeatures extends object, TData>(
  row: Row<TFeatures, TData>,
  columnId: string,
  filterValue: unknown,
) {
  if (!filterValue || filterValue === "ALL") return true;
  return row.getValue(columnId) === filterValue;
}

export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  columnResizingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  rowSelectionFeature,

  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    statusEquals: filterFn_statusEquals,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
  },
});

export type DataTableFeatures = typeof features;
