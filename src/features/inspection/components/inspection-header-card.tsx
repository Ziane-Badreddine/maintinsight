import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InspectionDetailData } from "../actions/inspection-detail";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  DRAFT: "outline",
  COMPLETED: "secondary",
  VALIDATED: "default",
};

export function InspectionHeaderCard({
  inspection,
}: {
  inspection: NonNullable<InspectionDetailData>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">
            {inspection.reference ?? `Inspection #${inspection.id}`}
          </CardTitle>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-4" />
              {format(new Date(inspection.inspectionDate), "PPP")}
            </span>
          </div>
        </div>

        <Badge variant={STATUS_VARIANT[inspection.status] ?? "outline"}>
          {inspection.status}
        </Badge>
      </CardHeader>

      {inspection.comment && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{inspection.comment}</p>
        </CardContent>
      )}
    </Card>
  );
}
