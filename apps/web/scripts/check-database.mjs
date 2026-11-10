import { withDatabase, reportFailure } from "./database.mjs";

try {
  await withDatabase(async (db) => {
    await db.query("SELECT id, label, token_hash, last_contact_at FROM public.devices LIMIT 0");
    await db.query("SELECT device_id, record_id, location, acquired_at, received_at FROM public.readings LIMIT 0");
    const result = await db.query("SELECT to_regprocedure('public.ingest_reading(text,jsonb)') AS function");
    if (!result.rows[0].function) throw new Error("Upload function missing.");
    console.log("Connection, tables, location column, and upload function are ready.");
    const configured = (process.env.WORKSPACE_DEVICE_IDS || "").split(",").map((id) => id.trim()).filter(Boolean);
    if (!configured.length) console.log("Next: set WORKSPACE_DEVICE_IDS to the devices this dashboard should show.");
    else {
      const devices = await db.query("SELECT id FROM public.devices WHERE id = ANY($1::text[])", [configured]);
      console.log(`${devices.rowCount} of ${configured.length} configured devices exist.`);
    }
  });
} catch (error) { reportFailure(error); }
