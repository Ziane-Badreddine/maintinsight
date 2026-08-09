import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ plantId: string }> },
) {
  const { plantId } = await params;

  const workshops = await prisma.workshop.findMany({
    where: { plantId: Number(plantId) },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(workshops);
}
