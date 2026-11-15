import { getPrisma } from "@/lib/prisma";

export async function GET() {
  let database = "not_configured";
  let schema = false;
  if (process.env.DATABASE_URL) {
    try {
      const rows = await getPrisma().$queryRaw<{ devices: string | null; readings: string | null }[]>`SELECT to_regclass('public.devices')::text AS devices, to_regclass('public.readings')::text AS readings`;
      database = "connected";
      schema = Boolean(rows[0]?.devices && rows[0]?.readings);
    } catch { database = "unavailable"; }
  }
  return Response.json({ server: "connected", database, schema, checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
