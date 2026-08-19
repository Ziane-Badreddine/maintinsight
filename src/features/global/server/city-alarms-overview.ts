import { prisma } from "@/lib/prisma";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

export const ALARM_STATUSES: EquipmentStatus[] = ["ALARM", "ALERT"];

const SEVERITY_ORDER: Record<string, number> = {
  ALARM: 1,
  ALERT: 2,
};

export interface AlarmMeasurementRow {
  id: number;
  type: string;
  point: string;
  value: number | null;
  unit: string | null;
}

export interface AlarmOverviewRow {
  id: number; // inspectionEquipmentId
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string | null;
  status: EquipmentStatus;
  plantId: number;
  plantName: string | null;
  plantCode: string;
  workshopId: number;
  workshopName: string;
  diagnosis: string | null;
  recommendation: string | null;
  note: string | null;
  inspectionDate: Date;
  inspectionReference: string | null;
  performedByName: string | null;
  measurements: AlarmMeasurementRow[];
}

/**
 * Equipment whose LATEST inspection is currently in an alarm-worthy
 * status (STOPPED / ALARM / ALERT), for a city (optionally scoped to
 * a plant). Mirrors the "current status" logic used in
 * getCityOverview (latest inspection per equipment), but keeps full
 * diagnosis/recommendation/measurements for the details sheet.
 *
 * NOTE: the `inspections.some(...)` clause below is only a
 * performance pre-filter to avoid loading every piece of equipment in
 * the city — it does NOT guarantee the equipment's *latest*
 * inspection is alarm-worthy (an equipment could have had an old
 * ALARM and since recovered to GOOD). The authoritative check is the
 * `ALARM_STATUSES.includes(latest.status)` re-check in JS below, once
 * we know what the actual latest inspection is. Both lists must stay
 * in sync with ALARM_STATUSES or equipment gets silently dropped.
 */
export async function getCityAlarmsOverview(
  cityId: number,
  plantId?: number | null,
): Promise<AlarmOverviewRow[]> {
  const equipments = await prisma.equipment.findMany({
    where: {
      workshop: {
        plant: {
          cityId,
          ...(plantId ? { id: plantId } : {}),
        },
      },
      inspections: {
        some: {
          status: { in: ALARM_STATUSES },
        },
      },
    },
    select: {
      id: true,
      name: true,
      code: true,
      workshop: {
        select: {
          id: true,
          name: true,
          plant: { select: { id: true, name: true, code: true } },
        },
      },
      inspections: {
        orderBy: { inspection: { inspectionDate: "desc" } },
        take: 1,
        select: {
          id: true,
          status: true,
          diagnosis: true,
          recommendation: true,
          note: true,
          inspection: {
            select: {
              inspectionDate: true,
              reference: true,
              performedBy: { select: { name: true } },
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
          },
        },
      },
    },
  });

  return equipments
    .map((eq): AlarmOverviewRow | null => {
      const latest = eq.inspections[0];
      if (!latest || !ALARM_STATUSES.includes(latest.status)) return null;

      return {
        id: latest.id,
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentCode: eq.code,
        status: latest.status,
        plantId: eq.workshop.plant.id,
        plantName: eq.workshop.plant.name,
        plantCode: eq.workshop.plant.code,
        workshopId: eq.workshop.id,
        workshopName: eq.workshop.name,
        diagnosis: latest.diagnosis,
        recommendation: latest.recommendation,
        note: latest.note,
        inspectionDate: latest.inspection.inspectionDate,
        inspectionReference: latest.inspection.reference,
        performedByName: latest.inspection.performedBy?.name ?? null,
        measurements: latest.measurements,
      };
    })
    .filter((row): row is AlarmOverviewRow => row !== null)
    .sort((a, b) => {
      const severityDiff = SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status];
      if (severityDiff !== 0) return severityDiff;
      return b.inspectionDate.getTime() - a.inspectionDate.getTime();
    });
}
