import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subHours, format } from "date-fns";
import { computeHealthRate, isCriticalStatus } from "../lib/health";
import type { DailyCityReport, ReportPeriod, ReportSection } from "../types";

export async function getDailyCityReportData(
  cityId: number,
  mode: ReportPeriod,
  sections: ReportSection[],
): Promise<DailyCityReport> {
  const now = new Date();
  const rangeStart = mode === "today" ? startOfDay(now) : subHours(now, 24);
  const rangeEnd = mode === "today" ? endOfDay(now) : now;

  const city = await prisma.city.findUniqueOrThrow({
    where: { id: cityId },
    include: {
      plants: {
        include: {
          workshops: {
            include: {
              equipments: {
                include: {
                  type: true,
                  inspections: {
                    orderBy: { inspection: { inspectionDate: "desc" } },
                    take: 1,
                    include: { inspection: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const inspectionsInRange = await prisma.inspection.findMany({
    where: {
      inspectionDate: { gte: rangeStart, lte: rangeEnd },
      equipments: { some: { equipment: { workshop: { plant: { cityId } } } } },
    },
    include: {
      performedBy: { select: { name: true } },
      equipments: { include: { equipment: true, measurements: true } },
    },
    orderBy: { inspectionDate: "desc" },
  });

  // --- equipment enriched with its last known status ---
  const allEquipments = city.plants.flatMap((p) =>
    p.workshops.flatMap((w) =>
      w.equipments.map((e) => ({
        ...e,
        plantName: p.name ?? p.code,
        lastStatus: e.inspections[0]?.status ?? null,
        lastInspectionDate: e.inspections[0]?.inspection.inspectionDate ?? null,
      })),
    ),
  );

  const knownStatuses = allEquipments
    .map((e) => e.lastStatus)
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const healthRate = computeHealthRate(knownStatuses);
  const criticalList = allEquipments.filter(
    (e) => e.lastStatus && isCriticalStatus(e.lastStatus),
  );

  // --- distribution by status (UI semantic order) ---
  const statusOrder = [
    "NOT_MONITORED",
    "STOPPED",
    "GOOD",
    "ACCEPTABLE",
    "ALERT",
    "ALARM",
  ] as const;
  const equipmentStatus = statusOrder.map((status) => ({
    status,
    count: allEquipments.filter(
      (e) => (e.lastStatus ?? "NOT_MONITORED") === status,
    ).length,
  }));

  // --- aggregation by plant ---
  const plants = city.plants.map((p) => {
    const eqs = allEquipments.filter((e) => e.plantName === (p.name ?? p.code));
    const statuses = eqs
      .map((e) => e.lastStatus)
      .filter((s): s is NonNullable<typeof s> => s !== null);
    return {
      id: p.id,
      name: p.name ?? p.code,
      equipmentCount: eqs.length,
      healthRate: computeHealthRate(statuses),
      critical: eqs.filter(
        (e) => e.lastStatus && isCriticalStatus(e.lastStatus),
      ).length,
      inspections: inspectionsInRange.filter((i) =>
        i.equipments.some((ie) => eqs.some((e) => e.id === ie.equipmentId)),
      ).length,
    };
  });

  // --- measurements ---
  const measurementRows = inspectionsInRange.flatMap((i) =>
    i.equipments.flatMap((ie) => ie.measurements),
  );
  const measurementTypes = [...new Set(measurementRows.map((m) => m.type))];
  const measurements = measurementTypes.map((type) => ({
    type,
    count: measurementRows.filter((m) => m.type === type).length,
    // Requires a threshold model (min/max per type+point) to be calculated properly.
    // Placeholder set to 0 pending a defined business rule.
    abnormal: 0,
  }));

  // --- inspections ---
  const completed = inspectionsInRange.filter(
    (i) => i.status !== "DRAFT",
  ).length;
  const pending = inspectionsInRange.filter((i) => i.status === "DRAFT").length;
  const criticalInspections = inspectionsInRange.filter((i) =>
    i.equipments.some((ie) => isCriticalStatus(ie.status)),
  ).length;

  const alarmsCount = allEquipments.filter(
    (e) => e.lastStatus === "ALARM",
  ).length;
  const alertsCount = allEquipments.filter(
    (e) => e.lastStatus === "ALERT",
  ).length;

  // --- recommendations generated from real data ---
  const recommendations: string[] = [];
  if (alarmsCount > 0) {
    recommendations.push(
      `⚠️ ${alarmsCount} equipment item(s) currently in alarm.`,
    );
  }
  if (pending > 0) {
    recommendations.push(`🔧 ${pending} inspection(s) awaiting validation.`);
  }
  const worstPlant = [...plants].sort((a, b) => a.healthRate - b.healthRate)[0];
  if (worstPlant && plants.length > 1) {
    recommendations.push(
      `📉 ${worstPlant.name} has the lowest health rate (${worstPlant.healthRate}%).`,
    );
  }

  return {
    city: { id: city.id, name: city.name, code: city.code },
    period: {
      date: format(now, "yyyy-MM-dd"),
      generatedAt: now.toISOString(),
      mode,
    },
    summary: {
      plants: city.plants.length,
      equipment: allEquipments.length,
      healthRate,
      criticalEquipment: criticalList.length,
      openInspections: pending,
      alerts: alertsCount,
      alarms: alarmsCount,
      measurementsToday: measurementRows.length,
    },
    equipmentStatus,
    plants,
    criticalEquipment: criticalList.map((e) => ({
      id: e.id,
      code: e.code,
      name: e.name,
      plantName: e.plantName,
      status: e.lastStatus!,
      healthRate: computeHealthRate([e.lastStatus!]),
      lastInspection: e.lastInspectionDate,
    })),
    inspections: {
      completed,
      pending,
      critical: criticalInspections,
      recent: inspectionsInRange.slice(0, 10).map((i) => ({
        id: i.id,
        reference: i.reference,
        inspectionDate: i.inspectionDate,
        performedBy: i.performedBy.name,
        status: i.status,
        equipmentCount: i.equipments.length,
      })),
    },
    measurements,
    alerts: [
      { type: "ALERT", count: alertsCount },
      { type: "ALARM", count: alarmsCount },
    ],
    recommendations,
    sections,
  };
}
