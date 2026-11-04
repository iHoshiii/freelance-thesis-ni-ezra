import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { ingest, type ReadingStore } from "./ingestion";

const token = "a".repeat(64);
const reading = {
  deviceId: "soil-001", recordId: "550e8400-e29b-41d4-a716-446655440000",
  sampleId: "sample-001", acquiredAt: null, timeQuality: "unknown",
  ph: null, moisturePercent: null, temperatureC: null, npkRaw: null,
};
function request(body: unknown = reading, authenticated = true) {
  return new Request("http://localhost/api/readings", {
    method: "POST", headers: { "content-type": "application/json", ...(authenticated ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}
function store(): ReadingStore {
  return {
    authorize: vi.fn().mockResolvedValue(true),
    save: vi.fn().mockResolvedValue({ acknowledgedRecordId: reading.recordId, receivedAt: "2026-11-04T00:00:00Z" }),
  };
}

describe("device upload boundary", () => {
  it("rejects requests without a device credential before storing", async () => {
    const db = store();
    expect((await ingest(request(reading, false), db)).status).toBe(401);
    expect(db.save).not.toHaveBeenCalled();
  });
  it("hashes the token and scopes authorization to the submitted device", async () => {
    const db = store();
    vi.mocked(db.authorize).mockResolvedValue(false);
    expect((await ingest(request(), db)).status).toBe(401);
    expect(db.authorize).toHaveBeenCalledWith("soil-001", createHash("sha256").update(token).digest("hex"));
    expect(db.save).not.toHaveBeenCalled();
  });
  it.each([
    { ...reading, ph: 15 },
    { ...reading, timeQuality: "synced" },
    { ...reading, acquiredAt: "2026-11-04T00:00:00Z" },
    { ...reading, moisturePercent: 101 },
    { ...reading, npkRaw: { n: 10, p: 20, k: 30 } },
  ])("rejects invalid values or ambiguous acquisition time", async (body) => {
    const db = store();
    expect((await ingest(request(body), db)).status).toBe(400);
    expect(db.save).not.toHaveBeenCalled();
  });
  it("rejects an oversized body without trusting Content-Length", async () => {
    const db = store();
    expect((await ingest(request({ ...reading, padding: "x".repeat(9000) }), db)).status).toBe(413);
    expect(db.save).not.toHaveBeenCalled();
  });
  it("never acknowledges a failed database write", async () => {
    const db = store();
    vi.mocked(db.save).mockRejectedValue(new Error("database unavailable"));
    const response = await ingest(request(), db);
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("acknowledgedRecordId");
  });
  it("returns 409 without acknowledging a conflicting identifier", async () => {
    const db = store();
    vi.mocked(db.save).mockResolvedValue({ conflict: true });
    const response = await ingest(request(), db);
    expect(response.status).toBe(409);
    expect(await response.json()).not.toHaveProperty("acknowledgedRecordId");
  });
  it("returns the persisted identifier and receipt time after storage", async () => {
    const db = store();
    const response = await ingest(request({ ...reading, recordId: reading.recordId.toUpperCase() }), db);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ acknowledgedRecordId: reading.recordId, receivedAt: "2026-11-04T00:00:00Z" });
    expect(db.save).toHaveBeenCalledWith(reading);
  });
  it("does not acknowledge an unexpected database identifier", async () => {
    const db = store();
    vi.mocked(db.save).mockResolvedValue({ acknowledgedRecordId: "wrong", receivedAt: "2026-11-04T00:00:00Z" });
    const response = await ingest(request(), db);
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("acknowledgedRecordId");
  });
});
