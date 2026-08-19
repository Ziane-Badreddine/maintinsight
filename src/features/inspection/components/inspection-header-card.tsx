import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InspectionDetailData } from "../actions/inspection-detail";

const STATUS_CONFIG: Record<
  string,
  { variant: "default" | "secondary" | "outline"; label: string }
> = {
  DRAFT: { variant: "outline", label: "Draft" },
  COMPLETED: { variant: "secondary", label: "Completed" },
  VALIDATED: { variant: "default", label: "Validated" },
};

export function InspectionHeaderCard({
  inspection,
}: {
  inspection: NonNullable<InspectionDetailData>;
}) {
  const statusConfig = STATUS_CONFIG[inspection.status] ?? {
    variant: "outline" as const,
    label: inspection.status,
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 ">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {inspection.reference ?? `Inspection #${inspection.id}`}
            </h1>

            <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarIcon className="size-4" />
              <span>{format(new Date(inspection.inspectionDate), "PPP")}</span>
            </div>
          </div>

          <Badge variant={statusConfig.variant} className="shrink-0">
            {statusConfig.label}
          </Badge>
        </div>

        {inspection.comment && (
          <div className="flex items-start gap-2  bg-muted/50 p-3 border border-foreground/50 border-dashed">
            <p className="text-sm text-muted-foreground">
              {inspection.comment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
