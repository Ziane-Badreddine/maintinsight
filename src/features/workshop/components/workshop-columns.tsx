"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  CopyIcon,
  DownloadIcon,
  FileJson2Icon,
  FileTextIcon,
  Table2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import {
  createNumberRangeFilterFn,
  createStatusEqualsFilterFn,
} from "@/components/common/data-table-filter-fns";

export interface WorkshopRow {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  total: number;
  healthRate: number;
  critical: number;
  statusCounts: Record<string, number>;
}

const columnHelper = createColumnHelper<DataTableFeatures, WorkshopRow>();

// --- format helpers ---

function formatAsRawText(w: WorkshopRow) {
  const breakdown = Object.entries(w.statusCounts)
    .map(
      ([status, count]) =>
        `${statusChartConfig[status as keyof typeof statusChartConfig]?.label ?? status}: ${count}`,
    )
    .join(", ");

  return [
    `Workshop: ${w.name}`,
    `Code: ${w.code ?? "—"}`,
    `Description: ${w.description ?? "—"}`,
    `Equipment: ${w.total}`,
    `Health rate: ${w.healthRate}%`,
    `Critical: ${w.critical}`,
    `Status breakdown: ${breakdown || "—"}`,
  ].join("\n");
}

function formatAsJson(w: WorkshopRow) {
  return JSON.stringify(w, null, 2);
}

function formatAsTsv(w: WorkshopRow) {
  const statusKeys = Object.keys(w.statusCounts);
  const headers = [
    "Name",
    "Code",
    "Description",
    "Equipment",
    "Health rate",
    "Critical",
    ...statusKeys,
  ];
  const values = [
    w.name,
    w.code ?? "",
    w.description ?? "",
    String(w.total),
    `${w.healthRate}%`,
    String(w.critical),
    ...statusKeys.map((k) => String(w.statusCounts[k])),
  ];
  return `${headers.join("\t")}\n${values.join("\t")}`;
}

// --- clipboard ---

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({ type: "success", title: `${label} copied to clipboard` });
  } catch {
    toast.add({ type: "error", title: "Failed to copy to clipboard" });
  }
}

// --- file download ---

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportWorkshop(w: WorkshopRow, format: "excel" | "text" | "json") {
  const base = w.name.replace(/\s+/g, "_").toLowerCase();

  if (format === "excel") {
    downloadFile(`${base}.csv`, formatAsTsv(w).replace(/\t/g, ","), "text/csv");
  } else if (format === "text") {
    downloadFile(`${base}.txt`, formatAsRawText(w), "text/plain");
  } else {
    downloadFile(`${base}.json`, formatAsJson(w), "application/json");
  }

  toast.add({ type: "success", title: "Workshop exported" });
}

interface CreateWorkshopColumnsOptions {
  onEdit: (workshop: WorkshopRow) => void;
  onDelete: (workshop: WorkshopRow) => void;
}

export function createWorkshopColumns({
  onEdit,
  onDelete,
}: CreateWorkshopColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Workshop" />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
              {row.original.description}
            </div>
          )}
        </div>
      ),
      filterFn: "includesString",
      sortFn: "text",
      enableHiding: false,
    }),
    columnHelper.accessor("code", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => row.original.code ?? "—",
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("total", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Equipments" />
      ),
      enableColumnFilter: false,
      sortFn: "alphanumeric",
    }),
    columnHelper.accessor((row) => row.statusCounts, {
      id: "breakdown",
      header: "Status breakdown",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(row.original.statusCounts).map(([status, count]) => {
            const config =
              statusChartConfig[status as keyof typeof statusChartConfig];
            return (
              <Badge
                key={status}
                variant="outline"
                className="text-xs"
                style={{ borderColor: config?.color, color: config?.color }}
              >
                {count} {config?.label ?? status}
              </Badge>
            );
          })}
        </div>
      ),
      filterFn: createStatusEqualsFilterFn<DataTableFeatures, WorkshopRow>(),
      enableSorting: false,
    }),
    columnHelper.accessor("healthRate", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Health rate" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.healthRate} className="w-[50%]" />
          <span className="text-sm text-muted-foreground w-9 text-right">
            {row.original.healthRate}%
          </span>
        </div>
      ),
      filterFn: createNumberRangeFilterFn<DataTableFeatures, WorkshopRow>(),
      sortFn: "alphanumeric",
    }),

    // --- actions dropdown (par ligne) ---
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const workshop = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 data-[state=open]:bg-muted transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventBaseUIHandler();
                      e.preventDefault();
                    }}
                  >
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={() => onEdit(workshop)}>
                  <PencilIcon className="size-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* --- copy (clipboard only, no DB write) --- */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <CopyIcon className="size-4" />
                    Copy
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() =>
                          copyToClipboard(formatAsTsv(workshop), "Excel row")
                        }
                      >
                        <Table2Icon className="size-4" />
                        As Excel row
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copyToClipboard(formatAsRawText(workshop), "Raw text")
                        }
                      >
                        <FileTextIcon className="size-4" />
                        As raw text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copyToClipboard(formatAsJson(workshop), "JSON")
                        }
                      >
                        <FileJson2Icon className="size-4" />
                        As JSON
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* --- export (file download) --- */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <DownloadIcon className="size-4" />
                    Export
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => exportWorkshop(workshop, "excel")}
                      >
                        <Table2Icon className="size-4" />
                        To Excel (.csv)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportWorkshop(workshop, "text")}
                      >
                        <FileTextIcon className="size-4" />
                        As raw text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportWorkshop(workshop, "json")}
                      >
                        <FileJson2Icon className="size-4" />
                        As JSON
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(workshop)}
                >
                  <Trash2Icon className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableHiding: false,
      enableSorting: false,
      size: 48,
    }),
  ]);
}
