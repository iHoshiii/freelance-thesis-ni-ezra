import { createClient } from "@supabase/supabase-js";
import { ingest } from "@/lib/ingestion";

export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ error: "Database not configured. Retain pending records." }, { status: 503 });
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return ingest(request, {
    async authorize(deviceId, tokenHash) {
      const { data, error } = await db.from("devices").select("id").eq("id", deviceId).eq("token_hash", tokenHash).maybeSingle();
      if (error) throw error;
      return data !== null;
    },
    async save(reading) {
      const { data, error } = await db.rpc("ingest_reading", { p_device_id: reading.deviceId, p_payload: reading });
      if (error || !data) throw error ?? new Error("Missing acknowledgement");
      return data;
    },
  });
}
