// features/plant/components/inspection-equipment-card.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { InspectionDetailData } from "../actions/inspection-detail";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    GOOD: "default",
    ACCEPTABLE: "secondary",
    ALERT: "secondary",
    ALARM: "destructive",
    STOPPED: "destructive",
    NOT_MONITORED: "secondary",
  };

type InspectionEquipmentEntry =
  NonNullable<InspectionDetailData>["equipments"][number];

export function InspectionEquipmentCard({
  entry,
}: {
  entry: InspectionEquipmentEntry;
}) {
  const [open, setOpen] = useState(false);
  const hasMeasurements = entry.measurements.length > 0;

  const { cityId, plantId } = useParams<{
    cityId: string;
    plantId: string;
  }>();

  return (
    <Card className="py-0 gap-0">
      <Collapsible
        open={open}
        onOpenChange={() => {
          if (hasMeasurements) {
            setOpen(!open);
          }
        }}
      >
        <CardHeader
          className={cn(
            "bg-muted/50 flex flex-row! w-full py-6 items-center justify-between",
            (entry.diagnosis || entry.recommendation || entry.note) &&
              "border-b",
          )}
        >
          <CollapsibleTrigger
            nativeButton={false}
            render={
              <div
                className={cn(
                  "flex-1 cursor-pointer",
                  hasMeasurements && "hover:opacity-80",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.equipment.name}</span>
                  {entry.equipment.code && (
                    <span className="text-xs text-muted-foreground">
                      {entry.equipment.code}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {entry.equipment.workshop.name}
                  {entry.equipment.type && ` · ${entry.equipment.type.name}`}
                </p>
              </div>
            }
          ></CollapsibleTrigger>

          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[entry.status] ?? "secondary"}>
              {entry.status}
            </Badge>

            {hasMeasurements && (
              <CollapsibleTrigger
                nativeButton
                render={
                  <button
                    type="button"
                    className="rounded-md p-1 hover:bg-accent"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                }
              ></CollapsibleTrigger>
            )}
          </div>
        </CardHeader>

        {(entry.diagnosis || entry.recommendation || entry.note) && (
          <CardContent className={cn("space-y-2 py-4 ", open && "border-b")}>
            {entry.diagnosis && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Diagnosis
                </span>
                <p className="text-sm">{entry.diagnosis}</p>
              </div>
            )}
            {entry.recommendation && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Recommendation
                </span>
                <p className="text-sm">{entry.recommendation}</p>
              </div>
            )}
            {entry.note && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Note
                </span>
                <p className="text-sm">{entry.note}</p>
              </div>
            )}
          </CardContent>
        )}

        {hasMeasurements && (
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ItemGroup>
                {entry.measurements.map((m, i) => (
                  <div key={m.id}>
                    <Item size="sm">
                      <ItemContent>
                        <ItemTitle>{m.point}</ItemTitle>
                        <ItemDescription>{m.type}</ItemDescription>
                      </ItemContent>
                      <div className="text-sm font-medium tabular-nums">
                        {m.value !== null ? `${m.value} ${m.unit ?? ""}` : "—"}
                      </div>
                    </Item>
                    {i < entry.measurements.length - 1 && <ItemSeparator />}
                  </div>
                ))}
              </ItemGroup>
            </CardContent>
          </CollapsibleContent>
        )}
      </Collapsible>
      <CardFooter className="bg-muted">
        <Button
          variant="outline"
          className={"ml-auto"}
          nativeButton={false}
          render={
            <Link
              href={`/dashboard/cities/${cityId}/plants/${plantId}/equipments/${entry.equipment.id}`}
            >
              View equipment
              <ExternalLink className="size-3.5" />
            </Link>
          }
        ></Button>
      </CardFooter>
    </Card>
  );
}
