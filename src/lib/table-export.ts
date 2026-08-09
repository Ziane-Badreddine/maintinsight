export type TableExportFormat = "excel" | "text" | "markdown";

export interface TableExportColumn<T> {
  key: keyof T;
  header: string;
  format?: (value: T[keyof T], row: T) => string;
}

const cellValue = <T,>(column: TableExportColumn<T>, row: T) =>
  column.format
    ? column.format(row[column.key], row)
    : String(row[column.key] ?? "");

export function tableToRows<T>(rows: T[], columns: TableExportColumn<T>[]) {
  return rows.map((row) => columns.map((column) => cellValue(column, row)));
}

export function serializeTable<T>(
  rows: T[],
  columns: TableExportColumn<T>[],
  format: TableExportFormat,
) {
  const values = tableToRows(rows, columns);
  if (format === "markdown") {
    const header = `| ${columns.map((column) => column.header).join(" | ")} |`;
    const divider = `| ${columns.map(() => "---").join(" | ")} |`;
    return [header, divider, ...values.map((row) => `| ${row.join(" | ")} |`)].join("\n");
  }
  if (format === "text") {
    return [columns.map((column) => column.header).join("\t"), ...values.map((row) => row.join("\t"))].join("\n");
  }
  return [columns.map((column) => escapeCsv(column.header)).join(","), ...values.map((row) => row.map(escapeCsv).join(","))].join("\n");
}

function escapeCsv(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export async function copyTable<T>(rows: T[], columns: TableExportColumn<T>[], format: TableExportFormat) {
  await navigator.clipboard.writeText(serializeTable(rows, columns, format));
}

export function downloadTable<T>(rows: T[], columns: TableExportColumn<T>[], format: TableExportFormat, filename: string) {
  const content = serializeTable(rows, columns, format);
  const blob = new Blob([content], { type: format === "excel" ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}.${format === "excel" ? "csv" : format === "markdown" ? "md" : "txt"}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const tableExportFormats: ReadonlyArray<{ value: TableExportFormat; label: string }> = [
  { value: "excel", label: "Excel / CSV" },
  { value: "text", label: "Plain text" },
  { value: "markdown", label: "Markdown" },
];

export function uniqueRows<T>(rows: T[]) {
  return Array.from(new Map(rows.map((row) => [JSON.stringify(row), row])).values());
}
