// features/equipments/components/equipment-actions-toolbar.tsx
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
import { EquipmentHeaderData } from "../actions/equipment-detail";
import { Route } from "next";

// --- format helpers ---

function formatAsRawText(equipment: EquipmentHeaderData) {
  return [
    `Equipment: ${equipment?.name}`,
    equipment?.code ? `Code: ${equipment?.code}` : null,
    `Workshop: ${equipment?.workshop.name}`,
    equipment?.type ? `Type: ${equipment?.type.name}` : null,
    `Status: ${equipment?.inspections[0]?.status ?? "NOT_MONITORED"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatAsJson(equipment: EquipmentHeaderData) {
  return JSON.stringify(equipment, null, 2);
}

function formatAsTsv(equipment: EquipmentHeaderData) {
  const headers = ["Name", "Code", "Workshop", "Type", "Status"];
  const values = [
    equipment?.name,
    equipment?.code ?? "",
    equipment?.workshop.name,
    equipment?.type?.name ?? "",
    equipment?.inspections[0]?.status ?? "NOT_MONITORED",
  ];
  return `${headers.join("\t")}\n${values.join("\t")}`;
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

function exportReport(equipment: EquipmentHeaderData) {
  const base = equipment?.name.replace(/\s+/g, "_").toLowerCase();
  downloadFile(
    `${base}.csv`,
    formatAsTsv(equipment).replace(/\t/g, ","),
    "text/csv",
  );
  toast.add({ type: "success", title: "Report exported" });
}

interface EquipmentActionsToolbarProps {
  equipment: EquipmentHeaderData;
  cityId: string;
}

export function EquipmentActionsToolbar({
  equipment,
  cityId,
}: EquipmentActionsToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="link"
        nativeButton={false}
        render={
          <Link
            href={`/dashboard/cities/${cityId}/equipments` as Route}
            className="text-muted-foreground! hover:text-foreground!"
          >
            <ArrowLeftIcon className="size-4" />
            Back to equipment
          </Link>
        }
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
                copyToClipboard(formatAsTsv(equipment), "Excel row")
              }
            >
              <Table2Icon className="size-4" />
              As Excel row
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                copyToClipboard(formatAsRawText(equipment), "Raw text")
              }
            >
              <FileTextIcon className="size-4" />
              As raw text
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(formatAsJson(equipment), "JSON")}
            >
              <FileJson2Icon className="size-4" />
              As JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => exportReport(equipment)}>
          <DownloadIcon className="size-4" />
          Export report
        </Button>
      </div>
    </div>
  );
}
