// features/plant/components/equipment-header-card.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_CONFIG } from "@/features/global/constants/equipment-status";
import { EquipmentHeaderData } from "../actions/equipment-detail";

export function EquipmentHeaderCard({
  equipment,
}: {
  equipment: NonNullable<EquipmentHeaderData>;
}) {
  const currentStatus = equipment.inspections[0]?.status ?? "NOT_MONITORED";
  const config = STATUS_CONFIG[currentStatus];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{equipment.name}</CardTitle>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {equipment.code && <span>{equipment.code}</span>}
            <span>
              {equipment.workshop.plant.name ?? equipment.workshop.plant.code} ·{" "}
              {equipment.workshop.name}
            </span>
            {equipment.type && <span>{equipment.type.name}</span>}
            <Badge variant="outline" className="text-xs font-normal">
              {equipment.scope}
            </Badge>
          </div>
        </div>

        <Badge
          variant="outline"
          style={{ borderColor: config.color, color: config.color }}
        >
          {config.label}
        </Badge>
      </CardHeader>

      {equipment.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {equipment.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
