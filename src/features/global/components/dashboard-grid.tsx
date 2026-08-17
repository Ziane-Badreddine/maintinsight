// features/global/components/dashboard/dashboard-grid.tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { SortableItem } from "./sortable-item";

import {
  DashboardWidgetId,
  DEFAULT_WIDGET_ORDER,
  WIDGET_SPAN,
} from "../config/dashboard-widgets";
import { useDashboardLayoutStore } from "../stores/dashboard-layout-store";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardGridProps {
  widgets: Record<DashboardWidgetId, React.ReactNode>;
}

export function DashboardGrid({ widgets }: DashboardGridProps) {
  const order = useDashboardLayoutStore((s) => s.order);
  const hidden = useDashboardLayoutStore((s) => s.hidden);
  const isEditMode = useDashboardLayoutStore((s) => s.isEditMode);
  const hasHydrated = useDashboardLayoutStore((s) => s.hasHydrated);
  const setOrder = useDashboardLayoutStore((s) => s.setOrder);
  const toggleWidget = useDashboardLayoutStore((s) => s.toggleWidget);

  const [, setActiveId] = useState<DashboardWidgetId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as DashboardWidgetId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(active.id as DashboardWidgetId);
    const newIndex = order.indexOf(over.id as DashboardWidgetId);
    setOrder(arrayMove(order, oldIndex, newIndex));
  }

  // Server render + first client render (before localStorage merge) use
  // this skeleton so markup matches between SSR and client, avoiding
  // a hydration mismatch AND avoiding the "jump" to the saved order.
  if (!hasHydrated) {
    return <DashboardGridSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {order.map((id) => (
            <SortableItem
              key={id}
              id={id}
              isEditMode={isEditMode}
              isHidden={hidden.includes(id)}
              onToggleVisibility={toggleWidget}
              className={WIDGET_SPAN[id]}
            >
              {widgets[id]}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {DEFAULT_WIDGET_ORDER.map((id) => (
        <Skeleton key={id} className={`h-48 rounded-lg ${WIDGET_SPAN[id]}`} />
      ))}
    </div>
  );
}
