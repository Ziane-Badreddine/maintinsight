// features/global/stores/dashboard-layout-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DashboardWidgetId,
  DEFAULT_WIDGET_ORDER,
} from "../config/dashboard-widgets";

interface DashboardLayoutState {
  order: DashboardWidgetId[];
  hidden: DashboardWidgetId[];
  isEditMode: boolean;
  hasHydrated: boolean;
  setOrder: (order: DashboardWidgetId[]) => void;
  toggleWidget: (id: DashboardWidgetId) => void;
  toggleEditMode: () => void;
  resetLayout: () => void;
  setEditMode: (value: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
  persist(
    (set) => ({
      order: DEFAULT_WIDGET_ORDER,
      hidden: [],
      isEditMode: false,
      hasHydrated: false,
      setOrder: (order) => set({ order }),
      toggleWidget: (id) =>
        set((s) => ({
          hidden: s.hidden.includes(id)
            ? s.hidden.filter((w) => w !== id)
            : [...s.hidden, id],
        })),
      toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),
      resetLayout: () => set({ order: DEFAULT_WIDGET_ORDER, hidden: [] }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
      setEditMode: (value) =>
        set({
          isEditMode: value,
        }),
    }),
    {
      name: "dashboard-layout",
      version: 1,
      onRehydrateStorage: () => (state) => {
        // called once localStorage data has been merged into the store
        state?.setHasHydrated(true);
      },
    },
  ),
);
