import { describe, expect, it } from "vitest";
import { serializeScan, type StoredScan } from "../scans/serialize";

const row: StoredScan = {
  deviceId: "soil-001", recordId: "550e8400-e29b-41d4-a716-446655440000", sampleId: "sample-001",
  location: null, acquiredAt: null, receivedAt: new Date("2026-11-16T12:00:00Z"), timeQuality: "unknown",
  ph: 4, moisturePercent: null, temperatureC: null, npkRaw: null, device: { label: "Field unit" },
  payload: { phCalibration: { beforeOffset: 3, offset: 1 }, unexpected: "do-not-expose" },
};

describe("scan correction display", () => {
  it("exposes acquisition-time correction without returning arbitrary payload fields or correcting pH again", () => {
    const scan = serializeScan(row);
    expect(scan.ph).toBe(4);
    expect(scan.phCalibration).toEqual({ beforeOffset: 3, offset: 1 });
    expect(JSON.stringify(scan)).not.toContain("do-not-expose");
  });
  it("keeps legacy or inconsistent metadata unavailable", () => {
    expect(serializeScan({ ...row, payload: {} }).phCalibration).toBeNull();
    expect(serializeScan({ ...row, payload: { phCalibration: { beforeOffset: 3, offset: 2 } } }).phCalibration).toBeNull();
  });
});
