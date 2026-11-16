import { z } from "zod";

const sensorState = z.enum(["ok", "error", "not_installed", "unknown"]);
export const telemetrySchema = z.object({
  deviceId: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
  batteryPercent: z.number().min(0).max(100).nullable(),
  pendingScans: z.number().int().min(0).max(10000000),
  syncState: z.enum(["idle", "syncing", "waiting_server", "error"]),
  ready: z.boolean(),
  sensors: z.object({ ph: sensorState, moisture: sensorState, temperature: sensorState, npk: sensorState }).strict(),
  lastError: z.string().trim().max(200).nullable().default(null),
}).strict().superRefine((value, context) => {
  if (value.syncState === "idle" && value.pendingScans > 0) context.addIssue({ code: "custom", path: ["syncState"], message: "Use waiting_server or syncing while scans remain queued." });
  if (value.syncState === "syncing" && value.pendingScans === 0) context.addIssue({ code: "custom", path: ["syncState"], message: "Use idle when the queue is empty." });
});
export type Telemetry = z.infer<typeof telemetrySchema>;
export type DeviceReport = { deviceId: string; receivedAt: string; data: Telemetry };
export const REPORT_MAX_AGE_MS = 90000;
export function reportIsFresh(report: DeviceReport | null | undefined, now = Date.now()) {
  if (!report) return false;
  const age = now - new Date(report.receivedAt).getTime();
  return age >= 0 && age <= REPORT_MAX_AGE_MS;
}
export function syncLabel(report: DeviceReport | null | undefined, now = Date.now()) {
  if (!report) return "Not reported";
  if (!reportIsFresh(report, now)) return "Device not reporting";
  return { idle: "No data to sync", syncing: "Syncing", waiting_server: "Waiting for server", error: "Sync problem" }[report.data.syncState];
}
