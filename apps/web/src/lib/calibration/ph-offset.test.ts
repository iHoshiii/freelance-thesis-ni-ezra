import { describe, expect, it } from "vitest";
import { calculateOffset, calibrationFileSchema, correctedPh, exportCalibration, offsetInputSchema, serialOffsetCommand } from "./ph-offset";
import { parseCalibrationSnapshot } from "./browser-store";
import { readingSchema } from "../reading";
import { scanCsvRow } from "../scans/csv";
import type { Scan } from "../scans/types";

const profile = {
  id: "550e8400-e29b-41d4-a716-446655440000", deviceId: "soil-001", reference: 4, measured: 3,
  previousOffset: 0, offset: 1, savedAt: "2026-11-16T12:00:00.000Z", notes: "pH 4 buffer",
};
const reading = {
  deviceId: "soil-001", recordId: profile.id, sampleId: "sample-001", acquiredAt: null,
  timeQuality: "unknown", ph: 4, moisturePercent: null, temperatureC: null, npkRaw: null,
};

describe("pH reference corrections", () => {
  it("corrects a pH 3 device reading to the pH 4 reference", () => {
    expect(calculateOffset({ reference: 4, measured: 3, previousOffset: 0 })).toBe(1);
    expect(correctedPh(3, 0, 1)).toBe(4);
    expect(serialOffsetCommand("soil-001", 1)).toBe("ph-offset soil-001 1.000000");
  });
  it("keeps the current offset when a previously corrected reading already matches", () => {
    expect(calculateOffset({ reference: 4, measured: 4, previousOffset: 1 })).toBe(1);
    expect(correctedPh(4, 1, 1)).toBe(4);
  });
  it("replaces the prior offset instead of stacking it onto an already corrected reading", () => {
    expect(calculateOffset({ reference: 4, measured: 3, previousOffset: 1 })).toBe(2);
    expect(correctedPh(3, 1, 2)).toBe(4);
  });
  it("supports negative offsets and real zero without clipping invalid results", () => {
    expect(calculateOffset({ reference: 4, measured: 5, previousOffset: 0 })).toBe(-1);
    expect(correctedPh(0, 0, 0)).toBe(0);
    expect(correctedPh(13.5, 0, 1)).toBeNull();
    expect(correctedPh(0.5, 0, -1)).toBeNull();
    expect(correctedPh(NaN, 0, 1)).toBeNull();
  });
  it("rejects impossible references, nonfinite offsets and invalid device identifiers", () => {
    expect(offsetInputSchema.safeParse({ reference: 15, measured: 3, previousOffset: 0 }).success).toBe(false);
    expect(offsetInputSchema.safeParse({ reference: 4, measured: 3, previousOffset: Infinity }).success).toBe(false);
    expect(offsetInputSchema.safeParse({ reference: 4, measured: 3, previousOffset: 5 }).success).toBe(false);
    expect(() => serialOffsetCommand("soil-001\nsync", 1)).toThrow();
  });
});

describe("calibration records and acquisition provenance", () => {
  it("exports a validated reference record and detects tampered or corrupt saved data", () => {
    expect(calibrationFileSchema.parse(JSON.parse(exportCalibration(profile))).profiles).toEqual([profile]);
    expect(parseCalibrationSnapshot(null)).toEqual({ profiles: [], error: null });
    expect(parseCalibrationSnapshot("bad JSON").error).toContain("preserved");
    expect(parseCalibrationSnapshot(JSON.stringify({ version: 1, profiles: [{ ...profile, offset: 2 }] })).error).not.toBeNull();
  });
  it("accepts legacy readings and records a matching correction without applying it again", () => {
    expect(readingSchema.parse(reading).ph).toBe(4);
    const corrected = readingSchema.parse({ ...reading, phCalibration: { beforeOffset: 3, offset: 1 } });
    expect(corrected.ph).toBe(4);
    expect(corrected.phCalibration).toEqual({ beforeOffset: 3, offset: 1 });
  });
  it("rejects correction metadata that conflicts with the reported pH", () => {
    expect(readingSchema.safeParse({ ...reading, phCalibration: { beforeOffset: 3, offset: 2 } }).success).toBe(false);
    expect(readingSchema.safeParse({ ...reading, ph: null, phCalibration: { beforeOffset: 3, offset: 1 } }).success).toBe(false);
  });
  it("exports the before-offset value and actual applied offset with the scan", () => {
    const scan: Scan = { ...reading, deviceLabel: "Field unit", location: null, receivedAt: profile.savedAt, phCalibration: { beforeOffset: 3, offset: 1 } };
    expect(scanCsvRow(scan)).toContain(',"3","1"\r\n');
  });
});
