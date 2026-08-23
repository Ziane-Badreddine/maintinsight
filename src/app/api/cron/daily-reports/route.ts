import { NextResponse } from "next/server";
import { startOfDay, endOfDay, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { generateCityDailyReport } from "@/features/report/lib/generate-report";
import { sendReportEmail } from "@/features/report/lib/send-report-email";
import { REPORT_SECTIONS } from "@/features/report/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const dateOnly = new Date(format(today, "yyyy-MM-dd"));

  const cities = await prisma.city.findMany();
  const results: { city: string; status: string; error?: string }[] = [];

  for (const city of cities) {
    // 1. A COMPLETED report already exists today for this city -> nothing to do
    const existing = await prisma.report.findUnique({
      where: { cityId_date: { cityId: city.id, date: dateOnly } },
    });
    if (existing?.status === "COMPLETED") {
      results.push({ city: city.code, status: "skipped_already_generated" });
      continue;
    }

    // 2. At least one inspection today for this city?
    const hasActivity = await prisma.inspection.count({
      where: {
        inspectionDate: { gte: dayStart, lte: dayEnd },
        equipments: {
          some: { equipment: { workshop: { plant: { cityId: city.id } } } },
        },
      },
    });
    if (hasActivity === 0) {
      results.push({ city: city.code, status: "skipped_no_activity" });
      continue;
    }

    try {
      const report = await generateCityDailyReport({
        cityId: city.id,
        period: "today",
        sections: REPORT_SECTIONS.map((s) => s.id),
        trigger: "AUTO",
      });

      await sendReportEmail({ city, report });
      results.push({ city: city.code, status: "generated_and_sent" });
    } catch (err) {
      results.push({ city: city.code, status: "failed", error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
