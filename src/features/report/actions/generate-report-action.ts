"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/features/dashboard/lib/permissions";
import { generateCityDailyReport } from "../lib/generate-report";
import type { ReportPeriod, ReportSection } from "../types";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { del } from "@vercel/blob";

export async function generateReportAction({
  cityId,
  period,
  sections,
}: {
  cityId: number;
  period: ReportPeriod;
  sections: ReportSection[];
}) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false as const, error: "Unauthorized" };
    }
    if (!hasPermission(session.user, { report: ["generate"] })) {
      return { success: false as const, error: "Forbidden" };
    }

    const report = await generateCityDailyReport({
      cityId,
      period,
      sections,
      trigger: "MANUAL",
      generatedById: session.user.id,
    });

    revalidatePath(`/dashboard/cities/${cityId}/reports`);
    return { success: true as const, report };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getTodayReportAction(cityId: number) {
  const dateOnly = new Date(format(new Date(), "yyyy-MM-dd"));

  const report = await prisma.report.findUnique({
    where: { cityId_date: { cityId, date: dateOnly } },
  });

  if (!report || report.status !== "COMPLETED" || !report.blobUrl) {
    return null;
  }

  return {
    id: report.id,
    blobUrl: report.blobUrl,
    generatedAt: report.updatedAt.toISOString(),
    trigger: report.trigger,
  };
}

export async function deleteReportAction({
  reportId,
  cityId,
}: {
  reportId: number;
  cityId: number;
}) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false as const, error: "Unauthorized" };
    }
    if (!hasPermission(session.user, { report: ["delete"] })) {
      return { success: false as const, error: "Forbidden" };
    }

    const report = await prisma.report.findUniqueOrThrow({
      where: { id: reportId },
    });
    if (report.cityId !== cityId) {
      return { success: false as const, error: "Forbidden" };
    }

    await deleteReportStorage(reportId);

    revalidatePath(`/dashboard/cities/${cityId}/reports`);
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function deleteReportStorage(reportId: number) {
  const report = await prisma.report.findUniqueOrThrow({
    where: { id: reportId },
  });

  if (report.blobUrl) {
    // del() is idempotent on the Vercel Blob side: no error if already absent.
    await del(report.blobUrl);
  }

  // Delete the row rather than emptying it: the next generation
  // recreates a clean Report via upsert (create), rather than an intermediate state.
  await prisma.report.delete({ where: { id: reportId } });
}
