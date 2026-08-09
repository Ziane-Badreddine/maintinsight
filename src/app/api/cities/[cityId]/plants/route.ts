import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cityId: string }> },
) {
  const { cityId } = await params;

  const plants = await prisma.plant.findMany({
    where: { cityId: Number(cityId) },
    orderBy: { code: "asc" },
  });

  return NextResponse.json(plants);
}
