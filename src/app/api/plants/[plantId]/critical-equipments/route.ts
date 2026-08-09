import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ plantId: string }> },
) {
  const { plantId } = await params;

  const equipments = await prisma.equipment.findMany({
    where: { workshop: { plantId: Number(plantId) } },
    include: {
      workshop: true,
      inspections: {
        orderBy: { inspection: { inspectionDate: "desc" } },
        take: 1,
        include: { inspection: true },
      },
    },
  });

  const critical = equipments
    .map((eq) => ({
      id: eq.id,
      name: eq.name,
      workshopName: eq.workshop.name,
      status: eq.inspections[0]?.status ?? "NOT_MONITORED",
      recommendation: eq.inspections[0]?.recommendation ?? null,
      inspectionDate: eq.inspections[0]?.inspection.inspectionDate ?? null,
    }))
    .filter((eq) => eq.status === "ALARM" || eq.status === "ALERT")
    .sort((a, b) => (a.status === "ALARM" ? -1 : 1));

  return NextResponse.json(critical);
}
