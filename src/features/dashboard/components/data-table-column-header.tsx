"use client";

import { type Column, type RowData } from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DataTableFeatures } from "./data-table-features";

interface DataTableColumnHeaderProps<TData extends RowData, TValue = unknown> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue = unknown>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "asc" ? (
        <ChevronUpIcon className="ml-2 size-3.5" />
      ) : sorted === "desc" ? (
        <ChevronDownIcon className="ml-2 size-3.5" />
      ) : (
        <ChevronsUpDownIcon className="ml-2 size-3.5 opacity-50" />
      )}
    </Button>
  );
}
