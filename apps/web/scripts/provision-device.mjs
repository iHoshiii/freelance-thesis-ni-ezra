import { createHash, randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { withDatabase, reportFailure } from "./database.mjs";

const [id, label, tokenFile] = process.argv.slice(2);
if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id) || !label || label.length > 120 || !tokenFile) {
  console.error("Usage: npm run device:provision -- soil-001 \"Field unit\" ./device-token.txt");
  process.exitCode = 1;
} else {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  try {
    await withDatabase(async (db) => {
      await db.query("BEGIN");
      try {
        await db.query("INSERT INTO public.devices (id, label, token_hash) VALUES ($1, $2, $3)", [id, label, tokenHash]);
        await writeFile(resolve(tokenFile), token + "\n", { flag: "wx", mode: 0o600 });
        await db.query("COMMIT");
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    });
    console.log(`Device ${id} created. Its token is in the specified file; it was not printed.`);
    console.log(`Add ${id} to WORKSPACE_DEVICE_IDS and configure the device to use that token.`);
  } catch (error) { reportFailure(error); }
}
