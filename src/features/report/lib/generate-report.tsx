import { renderToBuffer } from "@react-pdf/renderer";
import { put } from "@vercel/blob";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getDailyCityReportData } from "../data/get-daily-city-report-data";
import { ReportDocument } from "../pdf/report-document";
import type { ReportPeriod, ReportSection } from "../types";
import { ReportTrigger } from "../../../../prisma/generated/prisma/enums";

export async function generateCityDailyReport({
  cityId,
  period,
  sections,
  trigger,
  generatedById,
}: {
  cityId: number;
  period: ReportPeriod;
  sections: ReportSection[];
  trigger: ReportTrigger;
  generatedById?: string;
}) {
  const dateOnly = new Date(format(new Date(), "yyyy-MM-dd"));

  const report = await prisma.report.upsert({
    where: { cityId_date: { cityId, date: dateOnly } },
    create: {
      cityId,
      date: dateOnly,
      trigger,
      status: "GENERATING",
      period,
      sections,
      generatedById,
    },
    update: { status: "GENERATING", error: null, period, sections },
  });

  try {
    const data = await getDailyCityReportData(cityId, period, sections);
    const buffer = await renderToBuffer(<ReportDocument data={data} />);

    const blob = await put(
      `reports/${data.city.code}/${format(dateOnly, "yyyy-MM-dd")}.pdf`,
      buffer,
      {
        access: "public",
        contentType: "application/pdf",
        allowOverwrite: true,
      },
    );

    return prisma.report.update({
      where: { id: report.id },
      data: { status: "COMPLETED", blobUrl: blob.url },
    });
  } catch (err) {
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: "FAILED",
        error: err instanceof Error ? err.message : "Unknown error",
      },
    });
    throw err;
  }
}
