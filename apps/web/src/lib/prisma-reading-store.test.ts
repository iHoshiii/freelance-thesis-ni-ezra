import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaReadingStore } from "./prisma-reading-store";
import type { Reading } from "./reading";

const db = vi.hoisted(() => ({
  device: { findFirst: vi.fn() },
  $queryRaw: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("./prisma", () => ({ getPrisma: () => db }));

const reading: Reading = {
  deviceId: "soil-001", recordId: "550e8400-e29b-41d4-a716-446655440000",
  sampleId: "sample-001", acquiredAt: null, timeQuality: "unknown",
  ph: null, moisturePercent: null, temperatureC: null, npkRaw: null,
};
const acknowledgement = {
  acknowledgedRecordId: reading.recordId,
  receivedAt: "2026-11-09T00:00:00+00:00",
};

beforeEach(() => vi.resetAllMocks());

describe("Prisma reading storage", () => {
  it("requires the device identifier and token hash to match the same device", async () => {
    db.device.findFirst.mockResolvedValue(null);
    expect(await prismaReadingStore.authorize("soil-001", "token-hash")).toBe(false);
    expect(db.device.findFirst).toHaveBeenCalledWith({
      where: { id: "soil-001", tokenHash: "token-hash" }, select: { id: true },
    });
    db.device.findFirst.mockResolvedValue({ id: "soil-001" });
    expect(await prismaReadingStore.authorize("soil-001", "token-hash")).toBe(true);
  });

  it("passes sample content as a bound parameter to the atomic ingestion function", async () => {
    const input = { ...reading, sampleId: "'); DROP TABLE readings; --" };
    db.$queryRaw.mockResolvedValue([{ result: acknowledgement }]);
    expect(await prismaReadingStore.save(input)).toEqual(acknowledgement);
    const [sql, deviceId, payload] = db.$queryRaw.mock.calls[0];
    expect(sql.join("")).not.toContain(input.sampleId);
    expect(deviceId).toBe(input.deviceId);
    expect(JSON.parse(payload)).toEqual(input);
  });

  it("preserves conflicting identifier responses without acknowledging them", async () => {
    db.$queryRaw.mockResolvedValue([{ result: { conflict: true } }]);
    expect(await prismaReadingStore.save(reading)).toEqual({ conflict: true });
  });

  it.each([{ rows: [] }, { rows: [{ result: null }] }, { rows: [{ result: { acknowledgedRecordId: "wrong" } }] }])(
    "rejects missing or invalid database acknowledgements", async ({ rows }) => {
      db.$queryRaw.mockResolvedValue(rows);
      await expect(prismaReadingStore.save(reading)).rejects.toThrow();
    },
  );

  it("propagates database failures so the upload remains unacknowledged", async () => {
    db.$queryRaw.mockRejectedValue(new Error("database unavailable"));
    await expect(prismaReadingStore.save(reading)).rejects.toThrow("database unavailable");
  });
});
