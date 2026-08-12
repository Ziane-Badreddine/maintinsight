import {
  CheckCircle2,
  CircleAlert,
  CircleStop,
  CircleX,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

export const STATUS_CONFIG: Record<
  EquipmentStatus,
  {
    label: string;
    color: string;
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  GOOD: {
    label: "Good",
    color: "#22c55e",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    icon: CheckCircle2,
  },

  ACCEPTABLE: {
    label: "Acceptable",
    color: "#84cc16",
    badgeClass:
      "bg-lime-500/10 text-lime-600 border-lime-500/20 dark:text-lime-400",
    icon: ShieldCheck,
  },

  ALERT: {
    label: "Alert",
    color: "#f59e0b",
    badgeClass:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    icon: CircleAlert,
  },

  ALARM: {
    label: "Alarm",
    color: "#ef4444",
    badgeClass:
      "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    icon: CircleX,
  },

  STOPPED: {
    label: "Stopped",
    color: "#71717a",
    badgeClass:
      "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400",
    icon: CircleStop,
  },

  NOT_MONITORED: {
    label: "Not monitored",
    color: "#a1a1aa",
    badgeClass:
      "bg-zinc-400/10 text-zinc-500 border-zinc-400/20 dark:text-zinc-500",
    icon: EyeOff,
  },
};

export const STATUS_DISPLAY_ORDER: EquipmentStatus[] = [
  "GOOD",
  "ACCEPTABLE",
  "ALERT",
  "ALARM",
  "STOPPED",
  "NOT_MONITORED",
];
