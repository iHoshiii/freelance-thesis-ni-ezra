import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/api/workspace/route";

const mocks = vi.hoisted(() => ({ dashboard: vi.fn(), statistics: vi.fn(), workspace: vi.fn(), devices: vi.fn() }));
vi.mock("@/lib/dashboard-data", () => ({ loadDashboard: mocks.dashboard, loadStatistics: mocks.statistics, statisticsPeriod: (period: string) => ["7d", "30d", "year", "all"].includes(period) ? period : "30d" }));
vi.mock("@/lib/scans/repository", () => ({ loadWorkspace: mocks.workspace, loadDevices: mocks.devices }));
const request = (query: string) => new Request(`http://localhost/api/workspace?${query}`);

beforeEach(() => {
  vi.resetAllMocks();
  mocks.dashboard.mockResolvedValue({ workspace: { status: "ready" }, summary: { total: 12 } });
  mocks.workspace.mockResolvedValue({ status: "ready", scans: [], total: 0 });
  mocks.statistics.mockResolvedValue({ total: 12 });
  mocks.devices.mockResolvedValue({ status: "ready", locations: ["North plot"], lastUpload: null });
});

describe("workspace cache API", () => {
  it("rejects malformed filters before reading storage", async () => {
    expect((await GET(request("view=scans&period=custom&from=bad&to=bad"))).status).toBe(400);
    expect(mocks.workspace).not.toHaveBeenCalled();
  });
  it("preserves period and location as distinct scan inputs", async () => {
    await GET(request("view=scans&period=7d&location=North+plot&page=2"));
    expect(mocks.workspace).toHaveBeenCalledWith(expect.objectContaining({ period: "7d", location: "North plot", page: 2 }));
  });
  it("returns errors for failed storage instead of caching an empty success", async () => {
    mocks.dashboard.mockResolvedValue({ workspace: { status: "unavailable" } });
    mocks.workspace.mockResolvedValue({ status: "unavailable", scans: [] });
    mocks.statistics.mockResolvedValue(null);
    for (const view of ["dashboard", "scans", "statistics"]) expect((await GET(request(`view=${view}`))).status).toBe(503);
  });
  it("allows genuine setup state and empty scan results", async () => {
    mocks.dashboard.mockResolvedValue({ workspace: { status: "setup" } });
    expect((await GET(request("view=dashboard"))).status).toBe(200);
    const response = await GET(request("view=scans"));
    expect(await response.json()).toMatchObject({ total: 0 });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("normalizes statistics inputs and refuses unknown data views", async () => {
    await GET(request("view=statistics&period=bad&location=North+plot"));
    expect(mocks.statistics).toHaveBeenCalledWith("30d", "North plot");
    expect((await GET(request("view=unknown"))).status).toBe(400);
  });
});
