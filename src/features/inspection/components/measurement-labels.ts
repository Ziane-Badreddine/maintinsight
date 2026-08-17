import { MeasurementType } from "../../../../prisma/generated/prisma/enums";

export const MEASUREMENT_TYPE_LABEL: Record<MeasurementType, string> = {
  VIBRATION: "Vibration",
  TEMPERATURE: "Temperature",
  ULTRASOUND: "Ultrasound",
  PRESSURE: "Pressure",
  SPEED: "Speed",
  CURRENT: "Current",
  VOLTAGE: "Voltage",
  OTHER: "Other",
};

export function formatMeasurementValue(
  value: number | null | undefined,
  unit: string | null | undefined,
) {
  if (value == null) return "No value";
  return unit ? `${value} ${unit}` : String(value);
}
