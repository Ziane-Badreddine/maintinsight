import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  getSession: vi.fn(),
  permission: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("@/lib/auth-permissions", () => ({ hasSessionPermission: mocks.permission }));
vi.mock("@/lib/prisma", () => ({ prisma: { inspection: { findUnique: mocks.findUnique, update: mocks.update } } }));

import { validateInspection } from "./validate-inspection";

describe("validateInspection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.headers.mockResolvedValue(new Headers());
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
    mocks.permission.mockResolvedValue(true);
  });

  it("rejects unauthenticated requests", async () => {
    mocks.getSession.mockResolvedValue(null);
    await expect(validateInspection(1)).resolves.toEqual({ success: false, error: "UNAUTHENTICATED" });
  });

  it("rejects inspections that are not completed", async () => {
    mocks.findUnique.mockResolvedValue({ id: 1, status: "DRAFT" });
    await expect(validateInspection(1)).resolves.toEqual({ success: false, error: "INVALID_STATUS" });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("transitions a completed inspection to validated", async () => {
    mocks.findUnique.mockResolvedValue({ id: 1, status: "COMPLETED" });
    mocks.update.mockResolvedValue({ id: 1, status: "VALIDATED" });
    await expect(validateInspection(1)).resolves.toEqual({ success: true, inspection: { id: 1, status: "VALIDATED" } });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
