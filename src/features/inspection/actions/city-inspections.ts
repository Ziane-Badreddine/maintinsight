// features/inspection/actions/city-inspections.ts
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

export interface CityEquipmentStatusOverview {
  totalInspections: number;
  totalEquipmentEntries: number;
  statusCounts: Record<EquipmentStatus, number>;
}

/**
 * Même logique que getPlantEquipmentStatusOverview, mais agrégée à
 * travers tous les plants d'une city.
 */
export async function getCityEquipmentStatusOverview(
  cityId: number,
): Promise<CityEquipmentStatusOverview> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    unauthorized();
  }

  const [totalInspections, equipmentEntries] = await Promise.all([
    prisma.inspection.count({
      where: {
        // performedById: session.user.id,
        equipments: {
          some: { equipment: { workshop: { plant: { cityId } } } },
        },
      },
    }),
    prisma.inspectionEquipment.findMany({
      where: { equipment: { workshop: { plant: { cityId } } } },
      select: { status: true },
    }),
  ]);

  const statusCounts = emptyStatusCounts();
  for (const entry of equipmentEntries) {
    statusCounts[entry.status] += 1;
  }

  return {
    totalInspections,
    totalEquipmentEntries: equipmentEntries.length,
    statusCounts,
  };
}

export interface CityInspectionRow {
  id: number;
  reference: string | null;
  status: string; // InspectionStatus (workflow)
  inspectionDate: Date;
  performedByName: string;
  plantId: number;
  plantName: string;
  equipmentCount: number;
  statusBreakdown: Partial<Record<EquipmentStatus, number>>;
}

/**
 * Même logique que getPlantInspections, mais à travers tous les plants
 * d'une city. Chaque ligne porte son plantId/plantName puisque les
 * inspections viennent potentiellement de plants différents — utile
 * pour construire les liens de la data table.
 */
export async function getCityInspections(
  cityId: number,
  options: { from?: Date; to?: Date } = {},
): Promise<CityInspectionRow[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    unauthorized();
  }

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
    since.setMonth(since.getMonth() - (6 - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);
  }

  const inspections = await prisma.inspection.findMany({
    where: {
      // performedById: session.user.id,
      equipments: {
        some: { equipment: { workshop: { plant: { cityId } } } },
      },
      ...(options.from || options.to
        ? { inspectionDate: { gte: since, lte: until } }
        : {}),
    },
    select: {
      id: true,
      reference: true,
      status: true,
      inspectionDate: true,
      performedBy: { select: { name: true } },
      equipments: {
        select: {
          status: true,
          equipment: {
            select: {
              workshop: {
                select: {
                  plantId: true,
                  plant: { select: { name: true, code: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { inspectionDate: "desc" },
    take: 50,
  });

  return inspections.map((insp) => {
    const breakdown: Partial<Record<EquipmentStatus, number>> = {};
    for (const eq of insp.equipments) {
      breakdown[eq.status] = (breakdown[eq.status] ?? 0) + 1;
    }

    // Une inspection ne couvre en pratique qu'un seul plant à la fois
    // (les équipements d'une même campagne appartiennent au même site);
    // on prend le premier comme référence pour le lien.
    const first = insp.equipments[0]?.equipment.workshop;

    return {
      id: insp.id,
      reference: insp.reference,
      status: insp.status,
      inspectionDate: insp.inspectionDate,
      performedByName: insp.performedBy.name,
      plantId: first?.plantId ?? 0,
      plantName: first?.plant.name ?? first?.plant.code ?? "—",
      equipmentCount: insp.equipments.length,
      statusBreakdown: breakdown,
    };
  });
}

export interface CityStatusHistoryPoint {
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

export async function getCityStatusHistory(
  cityId: number,
  options: { from?: Date; to?: Date; monthsBack?: number } = {},
): Promise<CityStatusHistoryPoint[]> {
  const session = await auth.api.getSession({ headers: await headers() });
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
      equipment: { workshop: { plant: { cityId } } },
      inspection: {
        // performedById: session.user.id,
        inspectionDate: { gte: since, lte: until },
      },
    },
    select: {
      status: true,
      inspection: { select: { inspectionDate: true } },
    },
  });

  const points = new Map<string, CityStatusHistoryPoint>();

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
