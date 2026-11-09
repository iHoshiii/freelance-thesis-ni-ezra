import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client";
import type { Scan } from "./types";

const nutrients = z.object({ n: z.number(), p: z.number(), k: z.number(), unit: z.string() });
export const scanSelect = {
  deviceId: true, recordId: true, sampleId: true, location: true, acquiredAt: true, receivedAt: true,
  timeQuality: true, ph: true, moisturePercent: true, temperatureC: true, npkRaw: true,
  device: { select: { label: true } },
} satisfies Prisma.ReadingSelect;

export type StoredScan = Prisma.ReadingGetPayload<{ select: typeof scanSelect }>;

export function serializeScan(row: StoredScan): Scan {
  const npk = nutrients.safeParse(row.npkRaw);
  return {
    deviceId: row.deviceId, recordId: row.recordId, sampleId: row.sampleId,
    deviceLabel: row.device.label, location: row.location,
    acquiredAt: row.acquiredAt?.toISOString() ?? null, receivedAt: row.receivedAt.toISOString(),
    timeQuality: row.timeQuality, ph: row.ph, moisturePercent: row.moisturePercent,
    temperatureC: row.temperatureC, npkRaw: npk.success ? npk.data : null,
  };
}
