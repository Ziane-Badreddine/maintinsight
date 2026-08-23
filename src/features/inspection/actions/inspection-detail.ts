import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export async function getInspectionDetail(inspectionId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const inspection = await prisma.inspection.findUnique({
    where: {
      id: inspectionId,
      // performedById: session.user.id
    },
    select: {
      id: true,
      reference: true,
      status: true,
      inspectionDate: true,
      comment: true,
      performedBy: { select: { id: true, name: true, email: true } },
      equipments: {
        select: {
          id: true,
          status: true,
          diagnosis: true,
          recommendation: true,
          note: true,
          createdAt: true,
          equipment: {
            select: {
              id: true,
              code: true,
              name: true,
              scope: true,
              type: { select: { name: true } },
              workshop: { select: { name: true } },
            },
          },
          measurements: {
            select: {
              id: true,
              type: true,
              point: true,
              value: true,
              unit: true,
            },
            orderBy: { point: "asc" },
          },
        },
        orderBy: { equipment: { name: "asc" } },
      },
    },
  });

  return inspection;
}

export type InspectionDetailData = Awaited<
  ReturnType<typeof getInspectionDetail>
>;
