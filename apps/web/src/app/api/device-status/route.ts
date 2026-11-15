import { createHash } from "node:crypto";
import { getPrisma } from "@/lib/prisma";
import { telemetrySchema } from "@/lib/telemetry";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([^\s]{32,256})$/)?.[1];
  if (!token) return Response.json({ error: "Device authentication required." }, { status: 401 });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return Response.json({ error: "Send application/json." }, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "A device report is required." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 8192) { await reader.cancel(); return Response.json({ error: "Report exceeds 8 KiB." }, { status: 413 }); }
      chunks.push(chunk.value);
    }
  } catch { return Response.json({ error: "Unable to read report." }, { status: 400 }); }
  finally { reader.releaseLock(); }
  let input: unknown;
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const result = telemetrySchema.safeParse(input);
  if (!result.success) return Response.json({ error: "Invalid device report.", issues: result.error.issues }, { status: 400 });
  if (!process.env.DATABASE_URL) return Response.json({ error: "Database not configured." }, { status: 503 });
  try {
    const db = getPrisma();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    // Authenticate and persist together in one statement.
    const saved = await db.$queryRaw<{ received_at: Date }[]>`
      INSERT INTO public.device_telemetry (device_id, payload, received_at)
      SELECT id, ${JSON.stringify(result.data)}::jsonb, now() FROM public.devices
      WHERE id = ${result.data.deviceId} AND token_hash = ${tokenHash}
      ON CONFLICT (device_id) DO UPDATE SET payload = excluded.payload, received_at = excluded.received_at
      RETURNING received_at`;
    if (!saved.length) return Response.json({ error: "Invalid device credentials." }, { status: 401 });
    return Response.json({ deviceId: result.data.deviceId, receivedAt: saved[0].received_at.toISOString() });
  } catch { return Response.json({ error: "Device status storage unavailable. Retry later." }, { status: 503 }); }
}
