import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cityId: string }> },
) {
  const { cityId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }

  const equipments = await prisma.equipment.findMany({
    where: {
      workshop: { plant: { cityId: Number(cityId) } },
      inspections: {
        some: {
          inspection: {
            performedById: session?.user.id,
          },
        },
      },
    },
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
    .sort((a) => (a.status === "ALARM" ? -1 : 1));

  return NextResponse.json(critical);
}
