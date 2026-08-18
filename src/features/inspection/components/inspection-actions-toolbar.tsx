// features/inspection/components/inspection-actions-toolbar.tsx
"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CopyIcon,
  DownloadIcon,
  FileJson2Icon,
  FileTextIcon,
  Table2Icon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { InspectionDetailData } from "../actions/inspection-detail";
import { Route } from "next";

type Inspection = NonNullable<InspectionDetailData>;

// --- format helpers ---

function formatAsRawText(inspection: Inspection) {
  const header = [
    `Inspection: ${inspection.reference ?? `#${inspection.id}`}`,
    `Status: ${inspection.status}`,
    `Date: ${new Date(inspection.inspectionDate).toLocaleDateString()}`,
    `Performed by: ${inspection.performedBy?.name ?? "—"}`,
    inspection.comment ? `Comment: ${inspection.comment}` : null,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const body = inspection.equipments
    .map((e) =>
      [
        `- ${e.equipment.name}${e.equipment.code ? ` (${e.equipment.code})` : ""}`,
        `  Workshop: ${e.equipment.workshop.name}`,
        `  Status: ${e.status}`,
        e.diagnosis ? `  Diagnosis: ${e.diagnosis}` : null,
        e.recommendation ? `  Recommendation: ${e.recommendation}` : null,
        e.note ? `  Note: ${e.note}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return `${header}${body}`;
}

function formatAsJson(inspection: Inspection) {
  return JSON.stringify(inspection, null, 2);
}

// Tab-separated so pasting directly into Excel/Google Sheets lands as columns
function formatAsTsv(inspection: Inspection) {
  const headers = [
    "Equipment",
    "Code",
    "Workshop",
    "Status",
    "Diagnosis",
    "Recommendation",
    "Note",
  ];
  const rows = inspection.equipments.map((e) =>
    [
      e.equipment.name,
      e.equipment.code ?? "",
      e.equipment.workshop.name,
      e.status,
      e.diagnosis ?? "",
      e.recommendation ?? "",
      e.note ?? "",
    ].join("\t"),
  );
  return [headers.join("\t"), ...rows].join("\n");
}

// --- clipboard / download ---

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({ type: "success", title: `${label} copied to clipboard` });
  } catch {
    toast.add({ type: "error", title: "Failed to copy to clipboard" });
  }
}

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

function exportReport(inspection: Inspection) {
  const base = (inspection.reference ?? `inspection-${inspection.id}`)
    .replace(/\s+/g, "_")
    .toLowerCase();
  downloadFile(
    `${base}.csv`,
    formatAsTsv(inspection).replace(/\t/g, ","),
    "text/csv",
  );
  toast.add({ type: "success", title: "Report exported" });
}

interface InspectionActionsToolbarProps {
  inspection: Inspection;
  cityId: string;
}

export function InspectionActionsToolbar({
  inspection,
  cityId,
}: InspectionActionsToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="link"
        render={
          <Link
            href={`/dashboard/cities/${cityId}/inspections` as Route}
            className="text-muted-foreground! hover:text-foreground!"
          >
            <ArrowLeftIcon className="size-4" />
            Back to inspections
          </Link>
        }
        nativeButton={false}
      ></Button>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline">
                <CopyIcon className="size-4" />
                Copy as
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </Button>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                copyToClipboard(formatAsTsv(inspection), "Excel table")
              }
            >
              <Table2Icon className="size-4" />
              As Excel table
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                copyToClipboard(formatAsRawText(inspection), "Raw text")
              }
            >
              <FileTextIcon className="size-4" />
              As raw text
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(formatAsJson(inspection), "JSON")}
            >
              <FileJson2Icon className="size-4" />
              As JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => exportReport(inspection)}>
          <DownloadIcon className="size-4" />
          Export report
        </Button>
      </div>
    </div>
  );
}
