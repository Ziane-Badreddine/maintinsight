"use client";

import { ChevronDownIcon, Trash2Icon, DownloadIcon } from "lucide-react";
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
  onExport: () => void;
}

export function BulkActionsDropdown({
  count,
  onDelete,
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
        <DropdownMenuItem onClick={onExport}>
          <DownloadIcon className="size-4" />
          Export selected
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
