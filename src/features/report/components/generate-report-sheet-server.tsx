import { hasPermission } from "@/features/dashboard/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { GenerateReportSheet } from "./generate-report-sheet";
import { format } from "date-fns";

export default async function GenerateReportSheetServer({
  paramsPromise,
}: {
  paramsPromise: Promise<{ cityId: string }>;
}) {
  const session = await getSession();
  const canGenerate = hasPermission(session?.user ?? null, {
    report: ["generate"],
  });
  const { cityId } = await paramsPromise;
  const city = await prisma.city.findUnique({ where: { id: Number(cityId) } });
  if (!city) return;

  const dateOnly = new Date(format(new Date(), "yyyy-MM-dd"));

  const report = await prisma.report.findUnique({
    where: { cityId_date: { cityId: city.id, date: dateOnly } },
  });

  return canGenerate ? (
    <GenerateReportSheet
      cityId={city.id}
      cityName={city?.name}
      todayReport={report}
    />
  ) : null;
}
