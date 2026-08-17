"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  PencilIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  CopyIcon,
  DownloadIcon,
  FileJson2Icon,
  FileTextIcon,
  Table2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { statusChartConfig } from "@/features/plant/components/chart-config";
import type { DataTableFeatures } from "@/features/dashboard/components/data-table-features";
import {
  createDateRangeFilterFn,
  createEqualsFilterFn,
} from "@/components/common/data-table-filter-fns";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/features/dashboard/components/data-table-column-header";
import { Workshop } from "../../../../prisma/generated/prisma/client";
import {
  EquipmentHighlightLink,
  EquipmentLink,
} from "@/features/dashboard/components/equipment-columns";

export interface EquipmentRow {
  id: number;
  name: string;
  code: string | null;
  workshop: Workshop;
  status: keyof typeof statusChartConfig;
  diagnosis: string | null;
  lastInspectionDate: Date | null;
}

const columnHelper = createColumnHelper<DataTableFeatures, EquipmentRow>();

// --- format helpers ---

function formatAsRawText(e: EquipmentRow) {
  return [
    `Equipment: ${e.name}`,
    `Code: ${e.code ?? "—"}`,
    `Workshop: ${e.workshop.name}`,
    `Status: ${statusChartConfig[e.status]?.label ?? e.status}`,
    `Diagnosis: ${e.diagnosis ?? "—"}`,
    `Last inspection: ${
      e.lastInspectionDate ? e.lastInspectionDate.toLocaleDateString() : "—"
    }`,
  ].join("\n");
}

function formatAsJson(e: EquipmentRow) {
  return JSON.stringify(e, null, 2);
}

// Tab-separated so pasting directly into Excel/Google Sheets lands as columns
function formatAsTsv(e: EquipmentRow) {
  const headers = [
    "Name",
    "Code",
    "Workshop",
    "Status",
    "Diagnosis",
    "Last inspection",
  ];
  const values = [
    e.name,
    e.code ?? "",
    e.workshop.name,
    statusChartConfig[e.status]?.label ?? e.status,
    e.diagnosis ?? "",
    e.lastInspectionDate ? e.lastInspectionDate.toLocaleDateString() : "",
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

function exportEquipment(e: EquipmentRow, format: "excel" | "text" | "json") {
  const base = e.name.replace(/\s+/g, "_").toLowerCase();

  if (format === "excel") {
    downloadFile(`${base}.csv`, formatAsTsv(e).replace(/\t/g, ","), "text/csv");
  } else if (format === "text") {
    downloadFile(`${base}.txt`, formatAsRawText(e), "text/plain");
  } else {
    downloadFile(`${base}.json`, formatAsJson(e), "application/json");
  }

  toast.add({ type: "success", title: "Equipment exported" });
}

interface CreateEquipmentColumnsOptions {
  onEdit: (equipment: EquipmentRow) => void;
  onDelete: (equipment: EquipmentRow) => void;
}

export function createEquipmentColumns({
  onEdit,
  onDelete,
}: CreateEquipmentColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader title="Equipment" column={column} />
      ),
      cell: ({ row }) => (
        <EquipmentLink id={row.original.id} segment="equipments">
          {row.original.name ?? row.original.name}
        </EquipmentLink>
      ),
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("workshop", {
      header: ({ column }) => (
        <DataTableColumnHeader title="Workshop" column={column} />
      ),
      cell: ({ row }) => (
        <EquipmentHighlightLink
          id={row.original.workshop.id}
          segment="workshops"
        >
          {row.original.workshop.name}
        </EquipmentHighlightLink>
      ),
      filterFn: createEqualsFilterFn<DataTableFeatures, EquipmentRow>(),
      sortFn: (a, b) =>
        a.original.workshop.name.localeCompare(b.original.workshop.name),
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader title="Status" column={column} />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const config = statusChartConfig[status];
        return (
          <Badge
            variant="outline"
            style={{ borderColor: config?.color, color: config?.color }}
          >
            {config?.label ?? status}
          </Badge>
        );
      },
      filterFn: createEqualsFilterFn<DataTableFeatures, EquipmentRow>(),
    }),
    columnHelper.accessor("diagnosis", {
      header: "Diagnosis",
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1 max-w-xs block">
          {row.original.diagnosis ?? "—"}
        </span>
      ),
      filterFn: "includesString",
      enableSorting: false,
    }),
    columnHelper.accessor("lastInspectionDate", {
      header: ({ column }) => (
        <DataTableColumnHeader title="Last inspection" column={column} />
      ),
      cell: ({ row }) =>
        row.original.lastInspectionDate
          ? format(row.original.lastInspectionDate, "MMMM d, yyyy")
          : "—",
      filterFn: createDateRangeFilterFn<DataTableFeatures, EquipmentRow>(),
      sortFn: "datetime",
    }),

    // --- actions dropdown (par ligne) ---
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const equipment = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 data-[state=open]:bg-muted"
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
                <DropdownMenuItem onClick={() => onEdit(equipment)}>
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
                          copyToClipboard(formatAsTsv(equipment), "Excel row")
                        }
                      >
                        <Table2Icon className="size-4" />
                        As Excel row
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copyToClipboard(
                            formatAsRawText(equipment),
                            "Raw text",
                          )
                        }
                      >
                        <FileTextIcon className="size-4" />
                        As raw text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copyToClipboard(formatAsJson(equipment), "JSON")
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
                        onClick={() => exportEquipment(equipment, "excel")}
                      >
                        <Table2Icon className="size-4" />
                        To Excel (.csv)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportEquipment(equipment, "text")}
                      >
                        <FileTextIcon className="size-4" />
                        As raw text
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportEquipment(equipment, "json")}
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
                  onClick={() => onDelete(equipment)}
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
