// features/global/components/dashboard/sortable-item.tsx
"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardWidgetId } from "../config/dashboard-widgets";

interface SortableItemProps {
  id: DashboardWidgetId;
  isEditMode: boolean;
  isHidden: boolean;
  onToggleVisibility: (id: DashboardWidgetId) => void;
  className?: string;
  children: React.ReactNode;
}

export function SortableItem({
  id,
  isEditMode,
  isHidden,
  onToggleVisibility,
  className,
  children,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isHidden && !isEditMode) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        className,
        isDragging && "z-50 opacity-80",
        isEditMode && "rounded-lg ring-2 ring-dashed ring-muted-foreground/30",
        isHidden && isEditMode && "opacity-40",
      )}
    >
      {isEditMode && (
        <div className="absolute -top-3 right-2 z-10 flex items-center gap-1 rounded-md border bg-background px-1 py-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => onToggleVisibility(id)}
            className="rounded p-1 hover:bg-muted"
            title={isHidden ? "Show widget" : "Hide widget"}
          >
            {isHidden ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
