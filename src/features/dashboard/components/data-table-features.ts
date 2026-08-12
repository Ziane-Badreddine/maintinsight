import {
  columnFilteringFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
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
  type RowData, // <-- add this import
  rowSelectionFeature,
  columnSizingFeature,
  columnResizingFeature,
} from "@tanstack/react-table";

function filterFn_statusEquals<TFeatures extends object, TData extends RowData>(
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
  columnOrderingFeature,
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
