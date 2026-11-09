import { readFile } from "node:fs/promises";

const [tokenFile, sampleFile, address = "http://localhost:3000/api/readings"] = process.argv.slice(2);
try {
  if (!tokenFile || !sampleFile) throw new Error("Usage: npm run device:upload -- <token-file> <scan.json> [https-endpoint]");
  const url = new URL(address);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) {
    throw new Error("Use HTTPS outside localhost.");
  }
  const token = (await readFile(tokenFile, "utf8")).trim();
  if (!/^[^\s]{32,256}$/.test(token)) throw new Error("Invalid token file.");
  const payload = JSON.parse(await readFile(sampleFile, "utf8"));
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Upload returned HTTP ${response.status}. Keep the local record and retry after resolving the error.`);
  const result = await response.json();
  if (result.acknowledgedRecordId !== payload.recordId?.toLowerCase()) throw new Error("No matching acknowledgement. Keep the local record.");
  console.log(`Record ${result.acknowledgedRecordId} acknowledged at ${result.receivedAt}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Upload failed. Keep the local record.");
  process.exitCode = 1;
}
