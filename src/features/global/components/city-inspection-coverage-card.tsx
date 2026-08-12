import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { CityInspectionCoverage } from "@/features/global/server/city-inspection-coverage";
import { STATUS_CONFIG } from "../constants/equipment-status";

function pct(count: number, total: number) {
  if (total === 0) return 0;

  return Math.round((count / total) * 100);
}

export function CityInspectionCoverageCard({
  coverage,
}: {
  coverage: CityInspectionCoverage;
}) {
  const {
    totalEquipments,
    recentCount,
    staleCount,
    neverCount,
    staleDays,
    attentionList,
  } = coverage;

  const recentPct = pct(recentCount, totalEquipments);
  const stalePct = pct(staleCount, totalEquipments);
  const neverPct = pct(neverCount, totalEquipments);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatBlock
          icon={STATUS_CONFIG.GOOD.icon}
          backgroundColor={STATUS_CONFIG.GOOD.color}
          label={`Inspected (< ${staleDays}d)`}
          count={recentCount}
          percent={recentPct}
        />

        <StatBlock
          icon={STATUS_CONFIG.ALERT.icon}
          backgroundColor={STATUS_CONFIG.ALERT.color}
          label={`Not inspected for ${staleDays}d+`}
          count={staleCount}
          percent={stalePct}
        />

        <StatBlock
          icon={STATUS_CONFIG.ALARM.icon}
          backgroundColor={STATUS_CONFIG.ALARM.color}
          label="Never inspected"
          count={neverCount}
          percent={neverPct}
        />
      </div>

      {/* Attention table */}
      {attentionList.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>

                <TableHead>Site / Workshop</TableHead>

                <TableHead className="text-right">Last inspection</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {attentionList.map((row) => (
                <TableRow key={row.equipmentId}>
                  <TableCell className="font-medium">
                    {row.equipmentName}

                    {row.equipmentCode ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {row.equipmentCode}
                      </span>
                    ) : null}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {row.plantName} · {row.workshopName}
                  </TableCell>

                  <TableCell className="text-right">
                    {row.lastInspectionDate ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 text-amber-600 dark:text-amber-400"
                      >
                        {row.daysSinceLastInspection}d ago
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-500/40 text-red-600 dark:text-red-400"
                      >
                        Never
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}

function StatBlock({
  icon: Icon,

  backgroundColor,
  label,
  count,
  percent,
}: {
  icon: React.ElementType;

  backgroundColor?: string;
  label: string;
  count: number;
  percent: number;
}) {
  return (
    <Card
      style={
        {
          "--card-color": backgroundColor,
        } as React.CSSProperties
      }
      className={cn(
        "relative overflow-hidden bg-linear-to-b from-[color-mix(in_srgb,var(--card-color)_50%,transparent)] via-(--card-color)) to-card",
      )}
    >
      {/* Background icon */}
      <Icon
        className={cn(
          "pointer-events-none absolute right-0 top-1/4 size-32 -rotate-16 opacity-15",
        )}
      />

      <CardHeader className="relative pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{count}</span>

          <span className="text-xs text-muted-foreground">{percent}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
