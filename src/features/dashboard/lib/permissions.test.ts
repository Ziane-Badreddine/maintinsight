import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("allows managers to generate reports", () => {
    expect(hasPermission({ role: "manager" }, { report: ["generate"] })).toBe(true);
  });

  it("rejects inspectors from generating reports", () => {
    expect(hasPermission({ role: "inspector" }, { report: ["generate"] })).toBe(false);
  });

  it("supports comma-separated roles", () => {
    expect(hasPermission({ role: "viewer,manager" }, { report: ["download"] })).toBe(true);
  });

  it("allows public checks when no permission is requested", () => {
    expect(hasPermission(null)).toBe(true);
  });
});
