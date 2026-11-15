import { localDay } from "./scans/dates";

export function fillScanTimeline(period: string, rows: { label: string; count: number }[], now = new Date()) {
  const daily = period === "7d" || period === "30d";
  const end = new Date(`${localDay(now)}T00:00:00Z`);
  const start = new Date(end);
  if (daily) start.setUTCDate(start.getUTCDate() - (period === "7d" ? 6 : 29));
  else { start.setUTCDate(1); end.setUTCDate(1); start.setUTCMonth(start.getUTCMonth() - (period === "year" ? 12 : 30)); }
  const counts = new Map(rows.map((row) => [row.label, row.count]));
  const result = [];
  for (const day = new Date(start); day <= end; daily ? day.setUTCDate(day.getUTCDate() + 1) : day.setUTCMonth(day.getUTCMonth() + 1)) {
    const label = day.toISOString().slice(0, 10);
    result.push({ label, count: counts.get(label) ?? 0 });
  }
  return result;
}
