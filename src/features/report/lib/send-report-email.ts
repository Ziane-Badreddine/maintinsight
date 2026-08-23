import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { City, Report } from "../../../../prisma/generated/prisma/client";
import DailyReportReadyEmail from "@/features/emails/templates/daily-report-ready";
import { EMAIL_FROM, resend } from "@/lib/resend";

export async function sendReportEmail({
  city,
  report,
}: {
  city: City;
  report: Report;
}) {
  // NOTE: refine according to your actual access model.
  // If you have a User <-> City relationship (multi-city access per user),
  // replace this findMany with a join on that relationship.
  const recipients = await prisma.user.findMany({
    where: { role: { in: ["manager", "admin"] } },
    select: { email: true },
  });

  if (recipients.length === 0) return;
  if (!report.blobUrl) return;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: recipients.map((r) => r.email),
    subject: `Daily report — ${city.name} — ${format(report.date, "dd/MM/yyyy")}`,
    react: DailyReportReadyEmail({
      cityName: city.name,
      reportDateLabel: format(report.date, "EEEE d MMMM yyyy", {
        locale: enUS,
      }),
      reportUrl: report.blobUrl,
      trigger: report.trigger,
    }),
  });

  await prisma.report.update({
    where: { id: report.id },
    data: { emailSentAt: new Date() },
  });
}
