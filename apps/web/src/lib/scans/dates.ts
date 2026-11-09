export const TIME_ZONE = "Asia/Manila";
const DAY_MS = 86_400_000;

export function localDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function dayStart(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Choose valid start and end dates.");
  const date = new Date(`${day}T00:00:00+08:00`);
  if (!Number.isFinite(date.getTime()) || localDay(date) !== day) throw new Error("Choose valid start and end dates.");
  return date;
}

export function dateWindow(period: string, from: string, to: string, now = new Date()) {
  if (period === "all") return undefined;
  if (period === "custom") {
    const start = dayStart(from);
    const end = dayStart(to);
    if (start > end) throw new Error("Start date must be on or before end date.");
    return { gte: start, lt: new Date(end.getTime() + DAY_MS) };
  }
  const today = dayStart(localDay(now));
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 1;
  return { gte: new Date(today.getTime() - (days - 1) * DAY_MS), lt: new Date(today.getTime() + DAY_MS) };
}

export function formatDate(value: string | null, compact = false) {
  if (!value) return "Time unknown";
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TIME_ZONE, month: "short", day: "numeric", year: compact ? undefined : "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

export function formatValue(value: number | null | undefined, digits = 1) {
  return value == null ? "--" : new Intl.NumberFormat("en-PH", { maximumFractionDigits: digits }).format(value);
}
