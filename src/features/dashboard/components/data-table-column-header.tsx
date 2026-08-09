"use client";

import { type Column } from "@tanstack/react-table";
import { ArrowUpIcon, ArrowDownIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DataTableFeatures } from "./data-table-features";

interface DataTableColumnHeaderProps<TData> {
  column: Column<DataTableFeatures, TData, unknown>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData>) {
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
        <ArrowUpIcon className="ml-2 size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDownIcon className="ml-2 size-3.5" />
      ) : (
        <ChevronsUpDownIcon className="ml-2 size-3.5 opacity-50" />
      )}
    </Button>
  );
}
