import { prisma } from "@/lib/prisma";
import { STATUS_DISPLAY_ORDER } from "../constants/equipment-status";
import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

export interface CityOverviewData {
  city: {
    id: number;
    name: string;
    code: string;
  };
  plants: {
    id: number;
    code: string;
    name: string | null;
  }[];
  totals: {
    plants: number;
    workshops: number;
    equipments: number;
  };
  statusCounts: Record<EquipmentStatus, number>;
  equipmentByWorkshop: {
    workshopId: number;
    workshopName: string;
    plantCode: string;
    total: number;
    statusCounts: Record<EquipmentStatus, number>;
  }[];
  equipmentByPlant: {
    plantId: number;
    plantCode: string;
    plantName: string | null;
    workshopCount: number;
    total: number;
    statusCounts: Record<EquipmentStatus, number>;
  }[];
}

// Lightweight query for the header (city name + plant list),
// called outside the Suspense boundary for an instant render.
export async function getCityHeaderInfo(cityId: number) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: {
      id: true,
      name: true,
      plants: {
        select: { id: true, code: true, name: true },
        orderBy: { code: "asc" },
      },
    },
  });

  return city;
}

export async function getCityOverview(
  cityId: number,
): Promise<CityOverviewData | null> {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { id: true, name: true, code: true },
  });

  if (!city) return null;

  const [plants, workshops, equipments] = await Promise.all([
    prisma.plant.findMany({
      where: { cityId },
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" },
    }),

    prisma.workshop.findMany({
      where: { plant: { cityId } },
      select: {
        id: true,
        name: true,
        plantId: true,
        plant: { select: { code: true } },
        _count: { select: { equipments: true } },
      },
    }),

    // For each equipment, fetch the status of its latest inspection
    // (= current status / real-time monitoring), along with its workshop
    // so we can aggregate the status breakdown per workshop and per plant.
    prisma.equipment.findMany({
      where: { workshop: { plant: { cityId } } },
      select: {
        id: true,
        workshopId: true,
        workshop: { select: { plantId: true } },
        inspections: {
          orderBy: { inspection: { inspectionDate: "desc" } },
          take: 1,
          select: { status: true },
        },
      },
    }),
  ]);

  const statusCounts = STATUS_DISPLAY_ORDER.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<EquipmentStatus, number>,
  );

  // Counter per workshop: workshopId -> status -> count
  const workshopStatusMap = new Map<number, Record<EquipmentStatus, number>>();
  // Counter per plant: plantId -> status -> count
  const plantStatusMap = new Map<number, Record<EquipmentStatus, number>>();
  const plantTotalMap = new Map<number, number>();

  const emptyStatusCounts = () =>
    STATUS_DISPLAY_ORDER.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<EquipmentStatus, number>,
    );

  for (const eq of equipments) {
    const currentStatus = eq.inspections[0]?.status ?? "NOT_MONITORED";
    statusCounts[currentStatus] += 1;

    if (!workshopStatusMap.has(eq.workshopId)) {
      workshopStatusMap.set(eq.workshopId, emptyStatusCounts());
    }
    workshopStatusMap.get(eq.workshopId)![currentStatus] += 1;

    const plantId = eq.workshop.plantId;
    if (!plantStatusMap.has(plantId)) {
      plantStatusMap.set(plantId, emptyStatusCounts());
    }
    plantStatusMap.get(plantId)![currentStatus] += 1;
    plantTotalMap.set(plantId, (plantTotalMap.get(plantId) ?? 0) + 1);
  }

  const equipmentByWorkshop = workshops
    .map((w) => ({
      workshopId: w.id,
      workshopName: w.name,
      plantCode: w.plant.code,
      total: w._count.equipments,
      statusCounts: workshopStatusMap.get(w.id) ?? emptyStatusCounts(),
    }))
    .sort((a, b) => b.total - a.total);

  const equipmentByPlant = plants
    .map((p) => ({
      plantId: p.id,
      plantCode: p.code,
      plantName: p.name,
      workshopCount: workshops.filter((w) => w.plantId === p.id).length,
      total: plantTotalMap.get(p.id) ?? 0,
      statusCounts: plantStatusMap.get(p.id) ?? emptyStatusCounts(),
    }))
    .sort((a, b) => b.total - a.total);

  return {
    city,
    plants,
    totals: {
      plants: plants.length,
      workshops: workshops.length,
      equipments: equipments.length,
    },
    statusCounts,
    equipmentByWorkshop,
    equipmentByPlant,
  };
}

export interface StatusHistoryPoint {
  date: string; // sortable key, e.g. "2026-03" or "2026-03-15"
  label: string; // shown on the axis, e.g. "Mar 2026" or "Mar 15"
  inspectionCount: number; // number of campaigns aggregated into this point
  statusCounts: Record<EquipmentStatus, number>;
}

export type StatusHistoryGranularity = "day" | "month";

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
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

/**
 * History of the equipment fleet's status, aggregated by day or by month,
 * across the whole city (all plants/workshops combined).
 *
 * Principle: unlike "current status" (latest known inspection per
 * equipment), this looks at EVERY past inspection campaign and sums up
 * the statuses it contained, grouped by day or calendar month. This gives
 * a real trend over time ("the fleet is improving/degrading"), at the
 * cost of only counting equipment that was actually inspected during each
 * campaign (not the entire fleet at every point).
 *
 * Two modes for the time window:
 *  - options.from/to provided (e.g. from the date-range-picker) -> bound
 *    exactly to that period.
 *  - otherwise -> a rolling window of the last `monthsBack` months
 *    (default 6).
 *
 * Granularity: pass options.granularity to force "day" or "month". If
 * omitted, it's picked automatically from the window length — daily
 * buckets for a range of 31 days or less, monthly otherwise (a 6-month
 * default view would otherwise produce ~180 unreadable daily points).
 */
export async function getCityStatusHistory(
  cityId: number,
  options: {
    monthsBack?: number;
    from?: Date;
    to?: Date;
    granularity?: StatusHistoryGranularity;
  } = {},
): Promise<StatusHistoryPoint[]> {
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
  const granularity: StatusHistoryGranularity =
    options.granularity ?? (daySpan <= 31 ? "day" : "month");

  const rows = await prisma.inspectionEquipment.findMany({
    where: {
      equipment: { workshop: { plant: { cityId } } },
      inspection: { inspectionDate: { gte: since, lte: until } },
    },
    select: {
      status: true,
      inspection: { select: { inspectionDate: true } },
    },
  });

  const emptyStatusCounts = () =>
    STATUS_DISPLAY_ORDER.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<EquipmentStatus, number>,
    );

  // One point per day or per month between `since` and `until` inclusive,
  // initialized even with no inspection in that bucket (so the line stays
  // continuous, with no gaps).
  const points = new Map<string, StatusHistoryPoint>();

  if (granularity === "day") {
    const cursor = new Date(since);
    while (cursor <= until) {
      const key = dayKey(cursor);
      points.set(key, {
        date: key,
        label: DAY_LABEL_FORMATTER.format(cursor),
        inspectionCount: 0,
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
        inspectionCount: 0,
        statusCounts: emptyStatusCounts(),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  for (const row of rows) {
    const d = row.inspection.inspectionDate;
    const key = granularity === "day" ? dayKey(d) : monthKey(d);
    const point = points.get(key);
    if (!point) continue; // outside the requested window
    point.statusCounts[row.status] += 1;
    point.inspectionCount += 1;
  }

  return Array.from(points.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
