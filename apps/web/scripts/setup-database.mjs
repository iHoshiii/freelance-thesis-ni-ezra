import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { withDatabase, reportFailure } from "./database.mjs";

const migrations = ["202611040001_initial.sql", "202611090001_shared_workspace.sql"];
try {
  await withDatabase(async (db) => {
    await db.query("BEGIN");
    try {
      await db.query("SELECT pg_advisory_xact_lock(19091109)");
      await db.query(`CREATE TABLE IF NOT EXISTS public._soilsense_migrations (
        name text primary key, checksum text not null, applied_at timestamptz not null default now()
      )`);
      await db.query("REVOKE ALL ON public._soilsense_migrations FROM PUBLIC, anon, authenticated");
      for (const name of migrations) {
        const sql = (await readFile(new URL(`../../../supabase/migrations/${name}`, import.meta.url), "utf8")).replaceAll("\r\n", "\n");
        const checksum = createHash("sha256").update(sql).digest("hex");
        const applied = await db.query("SELECT checksum FROM public._soilsense_migrations WHERE name = $1", [name]);
        if (applied.rows.length) {
          if (applied.rows[0].checksum !== checksum) throw new Error("Applied migration changed.");
          console.log(`${name}: already applied`);
          continue;
        }
        if (name === migrations[0]) {
          const tables = await db.query("SELECT to_regclass('public.devices') AS devices, to_regclass('public.readings') AS readings");
          const { devices, readings } = tables.rows[0];
          if (Boolean(devices) !== Boolean(readings)) throw new Error("Existing schema is incomplete.");
          if (devices && readings) {
            await db.query("SELECT id, owner_id, label, token_hash, last_contact_at, created_at FROM public.devices LIMIT 0");
            await db.query("SELECT device_id, record_id, sample_id, acquired_at, time_quality, received_at, ph, moisture_percent, temperature_c, npk_raw, payload FROM public.readings LIMIT 0");
            const fn = await db.query("SELECT to_regprocedure('public.ingest_reading(text,jsonb)') AS function");
            if (!fn.rows[0].function) throw new Error("Initial ingestion function is missing.");
            console.log(`${name}: existing installation recognized`);
          } else await db.query(sql);
        } else await db.query(sql);
        await db.query("INSERT INTO public._soilsense_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
        console.log(`${name}: ready`);
      }
      await db.query("COMMIT");
      console.log("Database setup complete.");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  });
} catch (error) { reportFailure(error); }
