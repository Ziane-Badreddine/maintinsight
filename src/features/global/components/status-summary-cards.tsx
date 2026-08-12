// components/dashboard/status-summary-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STATUS_CONFIG,
  STATUS_DISPLAY_ORDER,
} from "../constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

interface StatusSummaryCardsProps {
  statusCounts: Record<EquipmentStatus, number>;
}

export function StatusSummaryCards({ statusCounts }: StatusSummaryCardsProps) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {STATUS_DISPLAY_ORDER.map((status) => {
        const config = STATUS_CONFIG[status];
        const count = statusCounts[status];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <Card
            key={status}
            style={
              {
                "--status-color": config.color,
              } as React.CSSProperties
            }
            className="relative overflow-hidden bg-linear-to-b from-[color-mix(in_srgb,var(--status-color)_50%,transparent)] via-(--status-color)) to-card"
          >
            <config.icon className=" absolute size-32 top-1/4 right-0 -rotate-16 opacity-20  " />
            <CardHeader className="pb-2 ">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
