import { describe, expect, it } from "vitest";
import { getDayRange } from "./day-range";

describe("getDayRange", () => {
  it("returns the exact local-day boundaries", () => {
    const date = new Date(2026, 7, 24, 14, 35, 12, 321);
    const { start, end } = getDayRange(date);

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(7);
    expect(start.getDate()).toBe(24);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });
});
