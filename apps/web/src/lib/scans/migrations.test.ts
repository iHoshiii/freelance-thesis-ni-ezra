import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";

let db: PGlite;
const payload = {
  deviceId: "soil-001", recordId: "550e8400-e29b-41d4-a716-446655440000", sampleId: "sample-001",
  location: "North plot", acquiredAt: null, timeQuality: "unknown", ph: 6.5,
  moisturePercent: null, temperatureC: null, npkRaw: null,
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid primary key);
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';`);
  for (const name of ["202611040001_initial.sql", "202611090001_shared_workspace.sql"]) {
    await db.exec(await readFile(new URL(`../../../../../supabase/migrations/${name}`, import.meta.url), "utf8"));
  }
}, 30000);

afterAll(async () => { if (db) await db.close(); });
beforeEach(async () => {
  await db.exec("TRUNCATE public.devices CASCADE");
  await db.query("INSERT INTO public.devices (id, label, token_hash) VALUES ($1, $2, $3)", ["soil-001", "Field unit", "a".repeat(64)]);
});

async function ingest(value: typeof payload) {
  return (await db.query<{ result: { acknowledgedRecordId?: string; receivedAt?: string; conflict?: boolean } }>(
    "SELECT public.ingest_reading($1, $2::jsonb) AS result", [value.deviceId, JSON.stringify(value)],
  )).rows[0].result;
}

describe("shared workspace SQL migrations", () => {
  it("provisions devices without creating user accounts", async () => {
    expect((await db.query<{ owner_id: string | null }>("SELECT owner_id FROM public.devices")).rows[0].owner_id).toBeNull();
  });
  it("stores optional locations and returns the original acknowledgement on retries", async () => {
    const first = await ingest(payload);
    expect(first.acknowledgedRecordId).toBe(payload.recordId);
    expect(await ingest(payload)).toEqual(first);
    const rows = await db.query<{ location: string }>("SELECT location FROM public.readings");
    expect(rows.rows).toEqual([{ location: "North plot" }]);
  });
  it("rejects conflicting reuse while preserving the original scan", async () => {
    await ingest(payload);
    expect(await ingest({ ...payload, ph: 7 })).toEqual({ conflict: true });
    expect((await db.query<{ ph: number }>("SELECT ph FROM public.readings")).rows[0].ph).toBe(6.5);
  });
  it("keeps legacy uploads without a location compatible", async () => {
    const legacy = { ...payload };
    delete (legacy as Partial<typeof payload>).location;
    expect((await ingest(legacy)).acknowledgedRecordId).toBe(payload.recordId);
    expect((await db.query<{ location: string | null }>("SELECT location FROM public.readings")).rows[0].location).toBeNull();
  });
  it("keeps device tokens and direct uploads inaccessible to anonymous browser roles", async () => {
    await db.exec("SET ROLE anon");
    try {
      await expect(db.query("SELECT token_hash FROM public.devices")).rejects.toThrow();
      await expect(db.query("SELECT public.ingest_reading('soil-001', '{}'::jsonb)")).rejects.toThrow();
    } finally { await db.exec("RESET ROLE"); }
  });
  it("can safely reapply the shared workspace migration", async () => {
    await db.exec(await readFile(new URL("../../../../../supabase/migrations/202611090001_shared_workspace.sql", import.meta.url), "utf8"));
    expect((await ingest(payload)).acknowledgedRecordId).toBe(payload.recordId);
  });
});
