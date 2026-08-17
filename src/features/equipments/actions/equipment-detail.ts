// features/plant/server/equipment-detail.ts
import { prisma } from "@/lib/prisma";
import { STATUS_DISPLAY_ORDER } from "@/features/global/constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

const emptyStatusCounts = () =>
  STATUS_DISPLAY_ORDER.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<EquipmentStatus, number>,
  );

export async function getEquipmentHeaderInfo(equipmentId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    unauthorized();
  }

  return prisma.equipment.findUnique({
    where: {
      id: equipmentId,
    },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      scope: true,

      type: {
        select: {
          name: true,
        },
      },

      workshop: {
        select: {
          name: true,
          plant: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },

      inspections: {
        where: {
          inspection: {
            performedById: session.user.id,
          },
        },
        select: {
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
}

export type EquipmentHeaderData = Awaited<
  ReturnType<typeof getEquipmentHeaderInfo>
>;

export interface EquipmentStatusHistoryPoint {
  date: string;
  label: string;
  statusCounts: Record<EquipmentStatus, number>;
}

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});
const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export async function getEquipmentStatusHistory(
  equipmentId: number,
  options: { from?: Date; to?: Date; monthsBack?: number } = {},
): Promise<EquipmentStatusHistoryPoint[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const { monthsBack = 6 } = options;

  let since: Date;
  let until: Date;

  if (options.from && options.to) {
    since = new Date(options.from);
    since.setHours(0, 0, 0, 0);
    until = new Date(options.to);
    until.setHours(23, 59, 59, 999);
  } else {
    until = new Date();
    since = new Date();
    since.setMonth(since.getMonth() - (monthsBack - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
  }

  const daySpan = Math.round(
    (until.getTime() - since.getTime()) / (1000 * 60 * 60 * 24),
  );
  const granularity: "day" | "month" = daySpan <= 31 ? "day" : "month";

  const rows = await prisma.inspectionEquipment.findMany({
    where: {
      equipmentId,
      inspection: {
        inspectionDate: { gte: since, lte: until },
        performedById: session.user.id,
      },
    },
    select: {
      status: true,
      inspection: { select: { inspectionDate: true } },
    },
  });

  const points = new Map<string, EquipmentStatusHistoryPoint>();

  if (granularity === "day") {
    const cursor = new Date(since);
    while (cursor <= until) {
      const key = dayKey(cursor);
      points.set(key, {
        date: key,
        label: DAY_LABEL_FORMATTER.format(cursor),
        statusCounts: emptyStatusCounts(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    const cursor = new Date(since.getFullYear(), since.getMonth(), 1);
    const end = new Date(until.getFullYear(), until.getMonth(), 1);
    while (cursor <= end) {
      const key = monthKey(cursor);
      points.set(key, {
        date: key,
        label: MONTH_LABEL_FORMATTER.format(cursor),
        statusCounts: emptyStatusCounts(),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  for (const row of rows) {
    const d = row.inspection.inspectionDate;
    const key = granularity === "day" ? dayKey(d) : monthKey(d);
    const point = points.get(key);
    if (!point) continue;
    point.statusCounts[row.status] += 1;
  }

  return Array.from(points.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export interface EquipmentInspectionRow {
  id: number; // InspectionEquipment id
  inspectionId: number;
  reference: string | null;
  inspectionDate: Date;
  performedByName: string;
  status: EquipmentStatus;
  diagnosis: string | null;
  recommendation: string | null;
  measurementCount: number;
}

export async function getEquipmentInspections(
  equipmentId: number,
): Promise<EquipmentInspectionRow[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    unauthorized();
  }
  const entries = await prisma.inspectionEquipment.findMany({
    where: { equipmentId, inspection: { performedById: session.user.id } },
    select: {
      id: true,
      status: true,
      diagnosis: true,
      recommendation: true,
      inspection: {
        select: {
          id: true,
          reference: true,
          inspectionDate: true,
          performedBy: { select: { name: true } },
        },
      },
      measurements: { select: { id: true } },
    },
    orderBy: { inspection: { inspectionDate: "desc" } },
    take: 50,
  });

  return entries.map((e) => ({
    id: e.id,
    inspectionId: e.inspection.id,
    reference: e.inspection.reference,
    inspectionDate: e.inspection.inspectionDate,
    performedByName: e.inspection.performedBy.name,
    status: e.status,
    diagnosis: e.diagnosis,
    recommendation: e.recommendation,
    measurementCount: e.measurements.length,
  }));
}
