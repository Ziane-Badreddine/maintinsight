// features/global/search-params/measurement-trend.ts
import { createLoader, parseAsStringEnum, type Options } from "nuqs/server";
import { useQueryStates } from "nuqs";

const MEASUREMENT_TYPES = [
  "VIBRATION",
  "TEMPERATURE",
  "ULTRASOUND",
  "PRESSURE",
  "SPEED",
  "CURRENT",
  "VOLTAGE",
  "OTHER",
] as const;

export const measurementTrendSearchParams = {
  measurementType: parseAsStringEnum([...MEASUREMENT_TYPES]).withDefault(
    "VIBRATION",
  ),
};

export const loadMeasurementTrendSearchParams = createLoader(
  measurementTrendSearchParams,
);

export const useMeasurementTrendFilters = (options: Options = {}) =>
  useQueryStates(measurementTrendSearchParams, {
    ...options,
    shallow: false,
  });
