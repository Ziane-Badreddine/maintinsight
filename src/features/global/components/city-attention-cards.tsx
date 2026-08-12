// components/dashboard/city-attention-cards.tsx
import { AlertTriangle, Ban, CircleX, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";
import { STATUS_CONFIG } from "../constants/equipment-status";

interface CityAttentionCardsProps {
  statusCounts: Record<EquipmentStatus, number>;
  equipmentByPlant: {
    plantId: number;
    plantCode: string;
    plantName: string | null;
    statusCounts: Record<EquipmentStatus, number>;
  }[];
}

export function CityAttentionCards({
  statusCounts,
  equipmentByPlant,
}: CityAttentionCardsProps) {
  // Rank plants by severity: ALARM weighs more than ALERT, so a plant
  // with a single alarm still outranks one with several plain alerts.
  const plantsNeedingAttention = equipmentByPlant
    .map((p) => ({
      name: p.plantName ?? p.plantCode,
      alarm: p.statusCounts.ALARM,
      alert: p.statusCounts.ALERT,
      score: p.statusCounts.ALARM * 10 + p.statusCounts.ALERT,
    }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const statusConfig = STATUS_CONFIG;

  return (
    <div className="flex flex-col gap-4">
      <Card
        style={
          {
            "--status-color": statusConfig["ALERT"].color,
          } as React.CSSProperties
        }
        className="relative overflow-hidden bg-linear-to-b from-[color-mix(in_srgb,var(--status-color)_50%,transparent)] via-(--status-color)) to-card"
      >
        <statusConfig.ALERT.icon className="pointer-events-none absolute right-0 top-1/4 size-32 -rotate-16 opacity-15" />
        <CardHeader className="pb-3 z-10">
          <CardTitle className="flex items-center gap-2 text-base">
            Plants needing attention
          </CardTitle>
          <CardDescription>
            Ranked by critical (alarm) and alert equipment count
          </CardDescription>
        </CardHeader>
        <CardContent className=" z-10">
          {plantsNeedingAttention.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No plant currently has critical or alert equipment.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {plantsNeedingAttention.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {p.alarm > 0 && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-xs font-medium",
                          statusConfig.ALARM.badgeClass,
                        )}
                      >
                        {p.alarm} alarm
                      </span>
                    )}
                    {p.alert > 0 && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-xs font-medium",
                          statusConfig.ALERT.badgeClass,
                        )}
                      >
                        {p.alert} alert
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card
        style={
          {
            "--status-color": statusConfig.ALARM.color,
          } as React.CSSProperties
        }
        className="relative overflow-hidden bg-linear-to-b from-[color-mix(in_srgb,var(--status-color)_50%,transparent)] via-(--status-color)) to-card"
      >
        <statusConfig.ALARM.icon className="pointer-events-none absolute right-0 top-1/4 size-32 -rotate-16 opacity-15" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Critical equipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.ALARM}</div>
          <p className="text-xs text-muted-foreground">
            Currently in ALARM status, citywide
          </p>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Not monitored
          </CardTitle>
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statusCounts.NOT_MONITORED}</div>
          <p className="text-xs text-muted-foreground">
            No inspection on record yet
          </p>
        </CardContent>
      </Card>  */}
    </div>
  );
}
