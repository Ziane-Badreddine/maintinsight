import { describe, expect, it } from "vitest";
import { measurementSchema, upsertMeasurementSchema } from "./measurement.schema";

const validMeasurement = { type: "TEMPERATURE" as const, point: "Motor" };

describe("measurement schemas", () => {
  it("accepts a valid measurement", () => {
    expect(measurementSchema.safeParse(validMeasurement).success).toBe(true);
  });

  it("rejects an empty point and a non-positive equipment id", () => {
    expect(measurementSchema.safeParse({ ...validMeasurement, point: "" }).success).toBe(false);
    expect(upsertMeasurementSchema.safeParse({ ...validMeasurement, inspectionEquipmentId: 0 }).success).toBe(false);
  });

  it("rejects an invalid measurement type", () => {
    expect(measurementSchema.safeParse({ ...validMeasurement, type: "invalid" }).success).toBe(false);
  });
});
