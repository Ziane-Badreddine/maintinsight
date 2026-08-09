import type { ChartConfig } from "@/components/ui/chart";

export const statusChartConfig = {
  GOOD: { label: "Good", color: "#16a34a" },
  ACCEPTABLE: { label: "Acceptable", color: "#eab308" },
  ALERT: { label: "Alert", color: "#f97316" },
  ALARM: { label: "Alarm", color: "#dc2626" },
  STOPPED: { label: "Stopped", color: "#6b7280" },
  NOT_MONITORED: { label: "Not monitored", color: "#94a3b8" },
} satisfies ChartConfig;
