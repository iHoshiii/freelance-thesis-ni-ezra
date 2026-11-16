import { describe, it, expect } from "vitest";
import { phBand } from "./soil-guidance";
import { fillScanTimeline } from "./statistics";

describe("soil guidance and statistics", () => {
  it("covers exact pH boundaries with no missing range", () => {
    expect([0, 4, 6, 7, 9, 14].map(phBand)).toEqual(["Very acidic", "Acidic", "Slightly acidic to neutral", "Slightly acidic to neutral", "Alkaline", "Very alkaline"]);
  });
  it("fills zero-count days using Philippine dates across a year boundary", () => {
    const rows = fillScanTimeline("7d", [{ label: "2027-01-01", count: 3 }], new Date("2026-12-31T18:00:00Z"));
    expect(rows).toHaveLength(7);
    expect(rows[0]).toEqual({ label: "2026-12-26", count: 0 });
    expect(rows[6]).toEqual({ label: "2027-01-01", count: 3 });
    expect(fillScanTimeline("all", [], new Date("2026-11-15"))).toHaveLength(31);
  });
});
