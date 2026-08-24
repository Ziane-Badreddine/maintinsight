import { describe, expect, it } from "vitest";
import { inspectionEquipmentSchema } from "./inspection-equipment.schema";

describe("inspectionEquipmentSchema", () => {
  it("accepts valid equipment findings", () => {
    expect(inspectionEquipmentSchema.safeParse({
      inspectionId: 1,
      equipmentId: 2,
      status: "GOOD",
      diagnosis: "No issue",
    }).success).toBe(true);
  });

  it("rejects invalid identifiers and oversized notes", () => {
    expect(inspectionEquipmentSchema.safeParse({ inspectionId: -1, equipmentId: 2, status: "OPERATIONAL" }).success).toBe(false);
    expect(inspectionEquipmentSchema.safeParse({ inspectionId: 1, equipmentId: 2, status: "GOOD", note: "x".repeat(2001) }).success).toBe(false);
  });
});
