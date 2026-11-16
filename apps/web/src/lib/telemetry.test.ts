import { describe, it, expect } from "vitest";
import { telemetrySchema, syncLabel, reportIsFresh } from "./telemetry";

const report = { deviceId: "soil-001", batteryPercent: 0, pendingScans: 0, syncState: "idle", ready: true, sensors: { ph: "ok", moisture: "unknown", temperature: "error", npk: "not_installed" } };
describe("device reporting", () => {
  it("accepts zero battery, rejects impossible queues and contradictory sync states", () => {
    expect(telemetrySchema.safeParse(report).success).toBe(true);
    expect(telemetrySchema.safeParse({ ...report, pendingScans: -1 }).success).toBe(false);
    expect(telemetrySchema.safeParse({ ...report, pendingScans: 3 }).success).toBe(false);
    expect(telemetrySchema.safeParse({ ...report, syncState: "syncing" }).success).toBe(false);
    expect(telemetrySchema.safeParse({ ...report, batteryPercent: 101 }).success).toBe(false);
  });
  it("never calls a stale or missing report synced", () => {
    const now = Date.parse("2026-11-15T12:00:00Z");
    const value = { deviceId: "soil-001", data: telemetrySchema.parse(report), receivedAt: new Date(now).toISOString() };
    expect(syncLabel(null, now)).toBe("Not reported");
    expect(syncLabel(value, now)).toBe("No data to sync");
    expect(reportIsFresh(value, now + 90001)).toBe(false);
    expect(syncLabel(value, now + 90001)).toBe("Device not reporting");
    expect(reportIsFresh(value, now - 1)).toBe(false);
  });
});
