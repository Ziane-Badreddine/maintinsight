"use client";

import {
  ChevronDownIcon,
  ClipboardIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkActionsDropdownProps {
  count: number;
  onDelete: () => void;
  onCopy: (format: "excel" | "text" | "markdown") => void;
  onExport: (format: "excel" | "text" | "markdown") => void;
}

export function BulkActionsDropdown({
  count,
  onDelete,
  onCopy,
  onExport,
}: BulkActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className={"border-border"}>
            {count} selected
            <ChevronDownIcon className="size-4" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onCopy("excel")}>
          <ClipboardIcon />
          Copy as Excel / CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy("text")}>
          <FileTextIcon />
          Copy as text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy("markdown")}>
          <FileTextIcon />
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport("excel")}>
          <FileSpreadsheetIcon />
          Export as Excel / CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("text")}>
          <DownloadIcon />
          Export as text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("markdown")}>
          <DownloadIcon />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon className="size-4" />
          Delete selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
