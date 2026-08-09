import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CheckCircle2Icon } from "lucide-react";
import { Route } from "next";

interface CriticalEquipmentTableProps {
  equipments: Array<{
    id: number;
    name: string;
    workshop: { name: string };
    latest: {
      status: string;
      diagnosis: string | null;
      inspection: { inspectionDate: Date };
    } | null;
  }>;
}

export function CriticalEquipmentTable({
  equipments,
}: CriticalEquipmentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Critical equipments</CardTitle>
      </CardHeader>
      <CardContent>
        {equipments.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle2Icon />
              </EmptyMedia>
              <EmptyTitle>No critical equipments</EmptyTitle>
              <EmptyDescription>
                Everything is within normal range for this plant.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Workshop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Last inspection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipments.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`equipments/${eq.id}` as Route}
                      className="hover:underline"
                    >
                      {eq.name}
                    </Link>
                  </TableCell>
                  <TableCell>{eq.workshop.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        eq.latest?.status === "ALARM"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {eq.latest?.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {eq.latest?.diagnosis}
                  </TableCell>
                  <TableCell>
                    {eq.latest?.inspection.inspectionDate.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
