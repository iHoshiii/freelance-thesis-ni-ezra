import { createHash } from "node:crypto";
import { readingSchema, type Reading } from "./reading";

export interface ReadingStore {
  authorize(deviceId: string, tokenHash: string): Promise<boolean>;
  save(reading: Reading): Promise<{ conflict: true } | { acknowledgedRecordId: string; receivedAt: string }>;
}

export async function ingest(request: Request, store: ReadingStore): Promise<Response> {
  const token = request.headers.get("authorization")?.match(/^Bearer ([^\s]{32,256})$/)?.[1];
  if (!token) return Response.json({ error: "Device authentication required." }, { status: 401 });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return Response.json({ error: "Send application/json." }, { status: 415 });
  }
  // Bound streamed input: Content-Length alone is not trustworthy.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "A reading is required." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return Response.json({ error: "Reading exceeds 8 KiB." }, { status: 413 });
      }
      chunks.push(chunk.value);
    }
  } catch {
    return Response.json({ error: "Unable to read request." }, { status: 400 });
  } finally { reader.releaseLock(); }
  let input: unknown;
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const result = readingSchema.safeParse(input);
  if (!result.success) return Response.json({ error: "Invalid reading.", issues: result.error.issues }, { status: 400 });
  try {
    const hash = createHash("sha256").update(token).digest("hex");
    if (!await store.authorize(result.data.deviceId, hash)) {
      return Response.json({ error: "Invalid device credentials." }, { status: 401 });
    }
    const saved = await store.save(result.data);
    if ("conflict" in saved) return Response.json({ error: "Record identifier already contains a different reading." }, { status: 409 });
    if (saved.acknowledgedRecordId !== result.data.recordId) throw new Error("Unexpected acknowledgement");
    return Response.json(saved);
  } catch {
    return Response.json({ error: "Storage unavailable. Retain this record and retry later." }, { status: 503 });
  }
}
