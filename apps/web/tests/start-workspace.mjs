import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { spawn } from "node:child_process";

const db = await PGlite.create();
await db.exec("SET TIME ZONE 'UTC'");
await db.exec(`CREATE SCHEMA auth; CREATE TABLE auth.users (id uuid primary key);
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';`);
for (const name of ["202611040001_initial.sql", "202611090001_shared_workspace.sql"]) {
  await db.exec(await readFile(new URL(`../../../supabase/migrations/${name}`, import.meta.url), "utf8"));
}
const tokenHash = createHash("sha256").update("test-device-token-".repeat(4)).digest("hex");
await db.query("INSERT INTO public.devices (id, label, token_hash) VALUES ($1, $2, $3), ($4, $5, $6)", ["soil-test", "Test field unit", tokenHash, "private-device", "PRIVATE DEVICE", "b".repeat(64)]);
for (let index = 0; index < 265; index++) {
  const acquiredAt = new Date(Date.now() - index * 86400000).toISOString();
  const record = { deviceId: "soil-test", recordId: randomUUID(), sampleId: `scan-${String(index + 1).padStart(3, "0")}`,
    location: index % 2 ? "South plot" : "North plot", acquiredAt, timeQuality: "synced",
    ph: index === 0 ? 0 : 6.2 + index % 5 / 10, moisturePercent: index === 3 ? null : 40 + index % 40,
    temperatureC: 24 + index % 7, npkRaw: { n: 20 + index, p: 15, k: 80, unit: "raw" } };
  await db.query("SELECT public.ingest_reading($1, $2::jsonb)", [record.deviceId, JSON.stringify(record)]);
}
const unknown = { deviceId: "soil-test", recordId: "550e8400-e29b-41d4-a716-446655440001", sampleId: "scan-unknown", acquiredAt: null, timeQuality: "unknown", ph: null, moisturePercent: null, temperatureC: null, npkRaw: null };
await db.query("SELECT public.ingest_reading($1, $2::jsonb)", [unknown.deviceId, JSON.stringify(unknown)]);
const privateScan = { ...unknown, deviceId: "private-device", recordId: "550e8400-e29b-41d4-a716-446655440099", sampleId: "PRIVATE SCAN" };
await db.query("SELECT public.ingest_reading($1, $2::jsonb)", [privateScan.deviceId, JSON.stringify(privateScan)]);
const socket = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 55439, maxConnections: 10 });
await socket.start();
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3100", "--hostname", "127.0.0.1"], {
  stdio: "inherit", windowsHide: true,
  env: { ...process.env, DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55439/postgres?sslmode=disable", DIRECT_URL: "", WORKSPACE_DEVICE_IDS: "soil-test" },
});
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  child.kill();
  await socket.stop();
  await db.close();
  process.exit(code);
}
process.on("SIGTERM", () => stop());
process.on("SIGINT", () => stop());
child.on("exit", (code) => stop(code ?? 0));
