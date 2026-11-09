import { test, expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execute = promisify(execFile);
const connection = "postgresql://postgres:postgres@127.0.0.1:55439/postgres?sslmode=disable";
const env = { ...process.env, DATABASE_URL: connection, DIRECT_URL: connection, WORKSPACE_DEVICE_IDS: "soil-test" };
const run = (name: string, args: string[] = []) => execute(process.execPath, [`scripts/${name}.mjs`, ...args], { env, windowsHide: true });

test("sets up an existing installation and provisions an acknowledged upload", async () => {
  const first = await run("setup-database");
  expect(first.stdout).toContain("Database setup complete.");
  const second = await run("setup-database");
  expect(second.stdout).toContain("already applied");
  expect((await run("check-database")).stdout).toContain("1 of 1 configured devices exist.");
  const directory = await mkdtemp(join(tmpdir(), "soilsense-setup-"));
  const token = join(directory, "device.token");
  const sample = join(directory, "scan.json");
  try {
    expect((await run("provision-device", ["cli-test", "CLI test unit", token])).stdout).toContain("Device cli-test created.");
    await writeFile(sample, JSON.stringify({ deviceId: "cli-test", recordId: "550e8400-e29b-41d4-a716-446655440070", sampleId: "cli-upload", acquiredAt: null, timeQuality: "unknown", ph: 6.5, moisturePercent: null, temperatureC: null, npkRaw: null }));
    const args = [token, sample, "http://127.0.0.1:3100/api/readings"];
    const upload = await run("upload-reading", args);
    expect(upload.stdout).toContain("550e8400-e29b-41d4-a716-446655440070 acknowledged");
    expect((await run("upload-reading", args)).stdout).toBe(upload.stdout);
  } finally {
    await Promise.allSettled([unlink(token), unlink(sample)]);
    await rmdir(directory);
  }
});
