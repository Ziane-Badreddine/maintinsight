// components/equipment-status-summary.tsx
import type { EquipmentRow } from "./equipment-columns";
import { statusChartConfig } from "@/features/plant/components/chart-config";

interface EquipmentStatusSummaryProps {
  data: EquipmentRow[];
}

export function EquipmentStatusSummary({ data }: EquipmentStatusSummaryProps) {
  const total = data.length;
  const counts = data.reduce<Record<string, number>>((acc, eq) => {
    acc[eq.status] = (acc[eq.status] ?? 0) + 1;
    return acc;
  }, {});

  const segments = Object.entries(statusChartConfig)
    .map(([status, cfg]) => ({
      status,
      label: cfg.label,
      color: cfg.color,
      count: counts[status] ?? 0,
      pct: total > 0 ? ((counts[status] ?? 0) / total) * 100 : 0,
    }))
    .filter((s) => s.count > 0);

  return (
    <div className="space-y-3 mb-4">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.status}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            className="h-full transition-all"
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((s) => (
          <div key={s.status} className="flex items-center gap-1.5 text-sm">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium">{s.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {s.count} ({Math.round(s.pct)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
