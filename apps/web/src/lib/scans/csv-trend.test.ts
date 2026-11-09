import { describe, expect, it } from "vitest";
import type { Scan } from "./types";
import { scanCsvRow } from "./csv";
import { trendData } from "./trend";

const scan: Scan = {
  deviceId: "soil-001", recordId: "550e8400-e29b-41d4-a716-446655440000", sampleId: "sample-001",
  deviceLabel: "Field unit", location: "North plot", acquiredAt: "2026-11-09T00:00:00Z",
  receivedAt: "2026-11-09T02:00:00Z", timeQuality: "synced", ph: 0, moisturePercent: null,
  temperatureC: -2, npkRaw: null,
};

describe("CSV export", () => {
  it("keeps missing readings empty and preserves real zero and negative measurements", () => {
    expect(scanCsvRow(scan)).toContain(',"0",,"-2",,,,');
    expect(scanCsvRow(scan)).not.toContain('"null"');
  });
  it.each(["=HYPERLINK(1)", "+cmd", "-cmd", "@SUM(1)", "  =SUM(1)", "\t=1"])("neutralizes spreadsheet formulas in %s", (sampleId) => {
    expect(scanCsvRow({ ...scan, sampleId })).toContain(`"'${sampleId}"`);
  });
  it("escapes quotes and preserves commas in user labels", () => {
    expect(scanCsvRow({ ...scan, location: 'Plot "A", east' })).toContain('"Plot ""A"", east"');
  });
});

describe("measurement trends", () => {
  it("does not connect a line across a missing reading or turn null into zero", () => {
    const scans = [scan, { ...scan, recordId: "2", acquiredAt: "2026-11-09T01:00:00Z", ph: null }, { ...scan, recordId: "3", acquiredAt: "2026-11-09T02:00:00Z", ph: 7 }];
    const result = trendData(scans, "ph");
    expect(result.count).toBe(2);
    expect(result.segments).toHaveLength(2);
    expect(result.segments.every((segment) => segment.length === 1)).toBe(true);
  });
  it("excludes unknown scan times and handles one measured point without invalid coordinates", () => {
    const result = trendData([scan, { ...scan, acquiredAt: null, ph: 14 }], "ph");
    expect(result.count).toBe(1);
    expect(Number.isFinite(result.segments[0][0].x)).toBe(true);
    expect(Number.isFinite(result.segments[0][0].y)).toBe(true);
  });
});
