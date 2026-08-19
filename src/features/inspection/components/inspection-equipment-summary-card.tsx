// features/inspection/components/inspection-equipment-summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusChartConfig } from "@/features/plant/components/chart-config";
import { InspectionDetailData } from "../actions/inspection-detail";

export function InspectionEquipmentSummaryCard({
  equipments,
}: {
  equipments: NonNullable<InspectionDetailData>["equipments"];
}) {
  const total = equipments.length;

  const statusCounts = equipments.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.status] = (acc[entry.status] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const statuses = (
    Object.keys(statusChartConfig) as Array<keyof typeof statusChartConfig>
  ).filter((status) => statusCounts[status] > 0);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">Equipment summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">{total}</span>
          <span className="text-sm text-muted-foreground">
            equipment{total !== 1 ? "s" : ""} inspected
          </span>
        </div>

        {/* barre empilée proportionnelle */}
        {total > 0 && (
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            {statuses.map((status) => (
              <div
                key={status}
                className="h-full"
                style={{
                  width: `${(statusCounts[status] / total) * 100}%`,
                  backgroundColor: statusChartConfig[status]?.color,
                }}
              />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {statuses.map((status) => {
            const config = statusChartConfig[status];
            return (
              <div
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: config?.color }}
                  />
                  {config?.label ?? status}
                </span>
                <Badge variant="outline" className="tabular-nums">
                  {statusCounts[status]}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
