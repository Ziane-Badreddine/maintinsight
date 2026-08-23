// GOOD/ACCEPTABLE/ALERT/ALARM are weighted. STOPPED and NOT_MONITORED are

import { EquipmentStatus } from "../../../../prisma/generated/prisma/enums";

// excluded from the calculation (no meaningful health assessment applies to them).
const HEALTH_WEIGHTS: Partial<Record<EquipmentStatus, number>> = {
  GOOD: 100,
  ACCEPTABLE: 80,
  ALERT: 50,
  ALARM: 20,
};

export function computeHealthRate(statuses: EquipmentStatus[]): number {
  const scored = statuses.filter((s) => s in HEALTH_WEIGHTS);
  if (scored.length === 0) return 0;

  const sum = scored.reduce((acc, s) => acc + (HEALTH_WEIGHTS[s] ?? 0), 0);
  return Math.round(sum / scored.length);
}

export function isCriticalStatus(status: EquipmentStatus): boolean {
  return status === "ALERT" || status === "ALARM";
}
