import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadScan, loadWorkspace } from "./repository";
import { defaultFilters } from "./filters";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  reading: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
  device: { findMany: vi.fn() },
}));
vi.mock("server-only", () => ({}));
vi.mock("../workspace-config", () => ({ workspaceConfig: mocks.config }));
vi.mock("../prisma", () => ({ getPrisma: () => mocks }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.config.mockReturnValue({ database: true, valid: true, deviceIds: ["soil-001"] });
  mocks.reading.findMany.mockResolvedValue([]);
  mocks.reading.findFirst.mockResolvedValue(null);
  mocks.reading.count.mockResolvedValue(0);
  mocks.reading.aggregate.mockResolvedValue({ _max: { receivedAt: null } });
  mocks.device.findMany.mockResolvedValue([]);
});

describe("shared workspace reads", () => {
  it("does not query the database until a device list is explicitly configured", async () => {
    mocks.config.mockReturnValue({ database: true, valid: false, deviceIds: [] });
    expect((await loadWorkspace(defaultFilters)).status).toBe("setup");
    expect(mocks.reading.findMany).not.toHaveBeenCalled();
  });
  it("scopes list, count, latest, upload status, and location queries to the allowed devices", async () => {
    await loadWorkspace(defaultFilters);
    for (const method of [mocks.reading.findMany, mocks.reading.findFirst, mocks.reading.count, mocks.reading.aggregate]) {
      for (const [query] of method.mock.calls) expect(query.where.deviceId).toEqual({ in: ["soil-001"] });
    }
    expect(mocks.device.findMany.mock.calls[0][0].where.id).toEqual({ in: ["soil-001"] });
    expect(mocks.device.findMany.mock.calls[0][0].select.tokenHash).toBeUndefined();
  });
  it("refuses direct record access for devices outside the workspace", async () => {
    expect(await loadScan("private-device", "550e8400-e29b-41d4-a716-446655440000")).toBeNull();
    expect(mocks.reading.findFirst).not.toHaveBeenCalled();
  });
  it("shows a storage failure instead of claiming a healthy empty database", async () => {
    mocks.reading.findMany.mockRejectedValue(new Error("connection failed"));
    expect((await loadWorkspace(defaultFilters)).status).toBe("unavailable");
  });
});
