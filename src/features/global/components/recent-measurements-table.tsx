// features/global/components/recent-measurements-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentMeasurement } from "../server/city-measurements";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    GOOD: "default",
    ACCEPTABLE: "secondary",
    ALERT: "secondary",
    ALARM: "destructive",
    STOPPED: "destructive",
    NOT_MONITORED: "secondary",
  };

interface RecentMeasurementsTableProps {
  measurements: RecentMeasurement[];
}

export function RecentMeasurementsTable({
  measurements,
}: RecentMeasurementsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Point</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-muted-foreground"
                >
                  No measurements recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              measurements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {m.inspectionEquipment.equipment.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {m.inspectionEquipment.equipment.workshop.plant.name} ·{" "}
                        {m.inspectionEquipment.equipment.workshop.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{m.point}</TableCell>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>
                    {m.value !== null ? `${m.value} ${m.unit ?? ""}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_VARIANT[m.inspectionEquipment.status] ??
                        "secondary"
                      }
                    >
                      {m.inspectionEquipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
