import { getPrisma } from "@/lib/prisma";
import { workspaceConfig } from "@/lib/workspace-config";
import { parseFilters } from "@/lib/scans/filters";
import { scanWhere, scanOrder, uploadedOrder } from "@/lib/scans/query";
import { scanSelect, serializeScan, type StoredScan } from "@/lib/scans/serialize";
import { csvHeader, scanCsvRow } from "@/lib/scans/csv";
import { localDay } from "@/lib/scans/dates";

export async function GET(request: Request) {
  const config = workspaceConfig();
  if (!config.database || !config.valid) return Response.json({ error: "Workspace setup is incomplete." }, { status: 503 });
  let filters;
  try { filters = parseFilters(Object.fromEntries(new URL(request.url).searchParams)); }
  catch { return Response.json({ error: "Invalid scan filters." }, { status: 400 }); }
  const where = { AND: [scanWhere(config.deviceIds, filters), { receivedAt: { lte: new Date() } }] };
  const orderBy = filters.basis === "scanned" ? scanOrder : uploadedOrder;
  const db = getPrisma();
  let batch: StoredScan[];
  try { batch = await db.reading.findMany({ where, select: scanSelect, orderBy, take: 250 }); }
  catch { return Response.json({ error: "Scan export is unavailable." }, { status: 503 }); }
  const encoder = new TextEncoder();
  let first = true;
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        if (first) { controller.enqueue(encoder.encode("\uFEFF" + csvHeader)); first = false; }
        controller.enqueue(encoder.encode(batch.map((row) => scanCsvRow(serializeScan(row))).join("")));
        if (batch.length < 250) { controller.close(); return; }
        const last = batch.at(-1)!;
        batch = await db.reading.findMany({ where, select: scanSelect, orderBy, take: 250, skip: 1, cursor: { deviceId_recordId: { deviceId: last.deviceId, recordId: last.recordId } } });
      } catch (error) { controller.error(error); }
    },
  });
  return new Response(stream, { headers: {
    "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="soilsense-scans-${localDay()}.csv"`,
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
  } });
}
