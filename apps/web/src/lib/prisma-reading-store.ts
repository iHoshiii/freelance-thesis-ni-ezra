import "server-only";
import { z } from "zod";
import type { ReadingStore } from "./ingestion";
import { getPrisma } from "./prisma";

const acknowledgementSchema = z.union([
  z.object({ conflict: z.literal(true) }).strict(),
  z.object({ acknowledgedRecordId: z.uuid(), receivedAt: z.iso.datetime({ offset: true }) }).strict(),
]);

export const prismaReadingStore: ReadingStore = {
  async authorize(deviceId, tokenHash) {
    const device = await getPrisma().device.findFirst({
      where: { id: deviceId, tokenHash },
      select: { id: true },
    });
    return device !== null;
  },
  async save(reading) {
    const rows = await getPrisma().$queryRaw<{ result: unknown }[]>`
      SELECT public.ingest_reading(${reading.deviceId}::text, ${JSON.stringify(reading)}::jsonb) AS result
    `;
    return acknowledgementSchema.parse(rows[0]?.result);
  },
};
