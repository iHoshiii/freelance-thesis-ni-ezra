import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "./prisma";
import { workspaceConfig } from "./workspace-config";
import { dateWindow } from "./scans/dates";
import { loadWorkspace } from "./scans/repository";
import { defaultFilters } from "./scans/filters";
import { telemetrySchema, type DeviceReport } from "./telemetry";
import { fillScanTimeline } from "./statistics";

export type Summary = { total: number; week: number; month: number; unknownTime: number };
export async function loadDashboard() {
  const checkedAt = Date.now();
  const workspace = await loadWorkspace(defaultFilters);
  const summary: Summary = { total: 0, week: 0, month: 0, unknownTime: 0 };
  const reports: DeviceReport[] = [];
  let telemetryAvailable = false;
  if (workspace.status !== "ready") return { workspace, summary, reports, telemetryAvailable, checkedAt };
  const config = workspaceConfig();
  const db = getPrisma();
  const scope = { deviceId: { in: config.deviceIds } };
  try {
    const [total, week, month, unknownTime] = await Promise.all([
      db.reading.count({ where: scope }),
      db.reading.count({ where: { ...scope, acquiredAt: dateWindow("7d", "", "") } }),
      db.reading.count({ where: { ...scope, acquiredAt: dateWindow("30d", "", "") } }),
      db.reading.count({ where: { ...scope, acquiredAt: null } }),
    ]);
    Object.assign(summary, { total, week, month, unknownTime });
  } catch { return { workspace: { ...workspace, status: "unavailable" as const }, summary, reports, telemetryAvailable, checkedAt }; }
  try {
    const rows = await db.$queryRaw<{ device_id: string; payload: unknown; received_at: Date }[]>`
      SELECT device_id, payload, received_at FROM public.device_telemetry WHERE device_id IN (${Prisma.join(config.deviceIds)})`;
    telemetryAvailable = true;
    for (const row of rows) {
      const parsed = telemetrySchema.safeParse(row.payload);
      if (parsed.success) reports.push({ deviceId: row.device_id, data: parsed.data, receivedAt: row.received_at.toISOString() });
    }
  } catch { /* Scan data still works on installations awaiting the telemetry migration. */ }
  return { workspace, summary, reports, telemetryAvailable, checkedAt };
}

export type StatMetric = { average: number | null; min: number | null; max: number | null; count: number; bins: { label: string; count: number }[] };
export type StatisticsData = { total: number; unknownTime: number; ph: StatMetric; moisture: StatMetric; temperature: StatMetric; npkCount: number; timeline: { label: string; count: number }[] };
export function statisticsPeriod(value: string | string[] | undefined) { return typeof value === "string" && ["7d", "30d", "year", "all"].includes(value) ? value : "30d"; }
export async function loadStatistics(period: string, location: string) : Promise<StatisticsData | null> {
  const config = workspaceConfig();
  if (!config.database || !config.valid) return null;
  const range = period === "year" ? { gte: new Date(Date.now() - 365 * 86400000), lt: new Date() } : dateWindow(period, "", "");
  const where = Prisma.sql`device_id IN (${Prisma.join(config.deviceIds)}) ${range ? Prisma.sql`AND acquired_at >= ${range.gte} AND acquired_at < ${range.lt}` : Prisma.empty} ${location ? Prisma.sql`AND location = ${location}` : Prisma.empty}`;
  try {
    const db = getPrisma();
    const [rows, timeline] = await Promise.all([
      db.$queryRaw<Record<string, number | null>[]>`SELECT count(*)::int AS total, count(*) FILTER (WHERE acquired_at IS NULL)::int AS unknown_time,
        avg(ph) AS ph_avg, min(ph) AS ph_min, max(ph) AS ph_max, count(ph)::int AS ph_count,
        count(*) FILTER (WHERE ph < 4)::int AS ph_0, count(*) FILTER (WHERE ph >= 4 AND ph < 6)::int AS ph_1,
        count(*) FILTER (WHERE ph >= 6 AND ph <= 7)::int AS ph_2, count(*) FILTER (WHERE ph > 7 AND ph <= 9)::int AS ph_3, count(*) FILTER (WHERE ph > 9)::int AS ph_4,
        avg(moisture_percent) AS moisture_avg, min(moisture_percent) AS moisture_min, max(moisture_percent) AS moisture_max, count(moisture_percent)::int AS moisture_count,
        count(*) FILTER (WHERE moisture_percent < 30)::int AS moisture_0, count(*) FILTER (WHERE moisture_percent >= 30 AND moisture_percent <= 60)::int AS moisture_1, count(*) FILTER (WHERE moisture_percent > 60)::int AS moisture_2,
        avg(temperature_c) AS temperature_avg, min(temperature_c) AS temperature_min, max(temperature_c) AS temperature_max, count(temperature_c)::int AS temperature_count,
        count(*) FILTER (WHERE temperature_c < 15)::int AS temperature_0, count(*) FILTER (WHERE temperature_c >= 15 AND temperature_c <= 30)::int AS temperature_1, count(*) FILTER (WHERE temperature_c > 30)::int AS temperature_2,
        count(npk_raw)::int AS npk_count FROM public.readings WHERE ${where}`,
      db.$queryRaw<{ label: string; count: number }[]>`SELECT to_char(date_trunc(${period === "7d" || period === "30d" ? "day" : "month"}, acquired_at AT TIME ZONE 'Asia/Manila'), 'YYYY-MM-DD') AS label, count(*)::int AS count FROM public.readings WHERE ${where} AND acquired_at IS NOT NULL GROUP BY 1 ORDER BY 1 DESC LIMIT 31`,
    ]);
    const row = rows[0];
    const metric = (name: string, labels: string[]): StatMetric => ({ average: row[`${name}_avg`], min: row[`${name}_min`], max: row[`${name}_max`], count: row[`${name}_count`] ?? 0, bins: labels.map((label, index) => ({ label, count: row[`${name}_${index}`] ?? 0 })) });
    return { total: row.total ?? 0, unknownTime: row.unknown_time ?? 0, ph: metric("ph", ["Below 4", "4 to below 6", "6 to 7", "Above 7 to 9", "Above 9"]), moisture: metric("moisture", ["Below 30%", "30 to 60%", "Above 60%"]), temperature: metric("temperature", ["Below 15°C", "15 to 30°C", "Above 30°C"]), npkCount: row.npk_count ?? 0, timeline: fillScanTimeline(period, timeline) };
  } catch { return null; }
}
