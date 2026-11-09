import { config } from "dotenv";
import pg from "pg";

config({ path: [".env.local", ".env"], quiet: true });

export async function withDatabase(task) {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before running database setup.");
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    return await task(client);
  } finally {
    await client.end();
  }
}

export function reportFailure(error) {
  if (error?.message === "Set DIRECT_URL or DATABASE_URL before running database setup.") console.error(error.message);
  else {
    const code = typeof error?.code === "string" && /^[A-Z0-9_]{2,30}$/.test(error.code) ? ` (${error.code})` : "";
    console.error(`Database operation failed${code}. Check the connection, permissions, and required migrations.`);
  }
  process.exitCode = 1;
}
