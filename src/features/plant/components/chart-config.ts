import type { ChartConfig } from "@/components/ui/chart";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

export const statusChartConfig = {
  GOOD: { label: "Good", color: "#16a34a" },
  ACCEPTABLE: { label: "Acceptable", color: "#eab308" },
  ALERT: { label: "Alert", color: "#f97316" },
  ALARM: { label: "Alarm", color: "#dc2626" },
  STOPPED: { label: "Stopped", color: "#3b82f6" },
  NOT_MONITORED: { label: "Not monitored", color: "#94a3b8" },
} satisfies ChartConfig;

export const STATUS_DISPLAY_ORDER: EquipmentStatus[] = [
  "NOT_MONITORED",
  "STOPPED",
  "GOOD",
  "ACCEPTABLE",
  "ALERT",
  "ALARM",
];
