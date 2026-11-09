import { describe, expect, it } from "vitest";
import { dateWindow, dayStart, localDay } from "./dates";
import { defaultFilters, parseFilters } from "./filters";
import { scanWhere } from "./query";

const now = new Date("2026-11-09T02:00:00Z");

describe("scan date filters", () => {
  it("uses Philippine midnight and includes today's complete calendar day", () => {
    expect(localDay(new Date("2026-11-08T17:00:00Z"))).toBe("2026-11-09");
    expect(dateWindow("today", "", "", now)).toEqual({ gte: new Date("2026-11-08T16:00:00Z"), lt: new Date("2026-11-09T16:00:00Z") });
  });
  it("includes today and the previous six calendar days in the seven-day filter", () => {
    expect(dateWindow("7d", "", "", now)?.gte.toISOString()).toBe("2026-11-02T16:00:00.000Z");
    expect(dateWindow("30d", "", "", now)?.gte.toISOString()).toBe("2026-10-10T16:00:00.000Z");
  });
  it("includes all of the custom end date using an exclusive next-day boundary", () => {
    expect(dateWindow("custom", "2026-10-31", "2026-11-01", now)).toEqual({ gte: new Date("2026-10-30T16:00:00Z"), lt: new Date("2026-11-01T16:00:00Z") });
  });
  it.each(["2026-02-30", "2026-13-01", "not-a-date"])("rejects invalid date %s", (date) => expect(() => dayStart(date)).toThrow());
  it("rejects reversed custom dates and invalid query parameters", () => {
    expect(() => parseFilters({ period: "custom", from: "2026-11-10", to: "2026-11-09" })).toThrow();
    expect(() => parseFilters({ period: "forever" })).toThrow();
    expect(() => parseFilters({ page: "-1" })).toThrow();
  });
});

describe("workspace scan query boundaries", () => {
  it("always restricts queries to configured device IDs even with search filters", () => {
    const where = scanWhere(["soil-001"], { ...defaultFilters, q: "' OR 1=1 --", location: "North plot" }, now);
    expect(where.deviceId).toEqual({ in: ["soil-001"] });
    expect(where.location).toBe("North plot");
    expect(where.OR).toHaveLength(2);
    expect(scanWhere([], defaultFilters, now).deviceId).toEqual({ in: [] });
  });
  it("filters measurement time without silently substituting upload time", () => {
    const scanned = scanWhere(["soil-001"], { ...defaultFilters, period: "today" }, now);
    expect(scanned.acquiredAt).toBeDefined();
    expect(scanned.receivedAt).toBeUndefined();
    const uploaded = scanWhere(["soil-001"], { ...defaultFilters, period: "today", basis: "uploaded" }, now);
    expect(uploaded.receivedAt).toBeDefined();
    expect(uploaded.acquiredAt).toBeUndefined();
  });
  it("includes unknown times in All and treats the unassigned location explicitly", () => {
    const where = scanWhere(["soil-001"], { ...defaultFilters, location: "__unassigned" }, now);
    expect(where.location).toBeNull();
    expect(where.acquiredAt).toBeUndefined();
  });
});
