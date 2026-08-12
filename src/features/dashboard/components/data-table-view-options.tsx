"use client";

import * as React from "react";
import { type Table, type Column, type RowData } from "@tanstack/react-table";
import { useSelector } from "@tanstack/react-store";
import {
  GripVerticalIcon,
  LockIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "./data-table-features";

interface DataTableViewOptionsProps<TData extends RowData> {
  table: Table<DataTableFeatures, TData>;
}

function SortableColumnItem<TData extends RowData>({
  column,
}: {
  column: Column<DataTableFeatures, TData>;
}) {
  const canHide = column.getCanHide();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: !canHide });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
    >
      <Checkbox
        checked={column.getIsVisible()}
        disabled={!canHide}
        onCheckedChange={(value) => column.toggleVisibility(!!value)}
      />
      <span className="flex-1 truncate capitalize">{column.id}</span>
      {canHide ? (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      ) : (
        <LockIcon className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}

function HiddenColumnItem<TData extends RowData>({
  column,
}: {
  column: Column<DataTableFeatures, TData>;
}) {
  return (
    <div
      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
      onClick={() => column.toggleVisibility(true)}
    >
      <Checkbox
        checked={false}
        onCheckedChange={() => column.toggleVisibility(true)}
      />
      <span className="flex-1 truncate capitalize">{column.id}</span>
    </div>
  );
}

export function DataTableViewOptions<TData extends RowData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  // Subscribe so this component re-renders whenever columnOrder changes
  const columnOrder = useSelector(table.atoms.columnOrder);

  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  // Build the ordered list: columnOrder first, then any hideable column
  // not yet present in columnOrder (e.g. on first render before it's set)
  const orderedIds =
    columnOrder.length > 0 ? columnOrder : hideableColumns.map((c) => c.id);

  const orderedHideableColumns = orderedIds
    .map((id) => hideableColumns.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const activeColumns = orderedHideableColumns.filter((c) => c.getIsVisible());
  const availableColumns = orderedHideableColumns.filter(
    (c) => !c.getIsVisible(),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentOrder =
      table.store.state.columnOrder.length > 0
        ? table.store.state.columnOrder
        : table.getAllColumns().map((c) => c.id);

    const oldIndex = currentOrder.indexOf(String(active.id));
    const newIndex = currentOrder.indexOf(String(over.id));

    table.setColumnOrder(arrayMove(currentOrder, oldIndex, newIndex));
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <SlidersHorizontalIcon className="size-4" />
            Columns
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          {" "}
          <DropdownMenuLabel>Active columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeColumns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-0.5 p-1">
                {activeColumns.map((column) => (
                  <SortableColumnItem key={column.id} column={column} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {availableColumns.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Available columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex flex-col gap-0.5 p-1">
                {availableColumns.map((column) => (
                  <HiddenColumnItem key={column.id} column={column} />
                ))}
              </div>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
