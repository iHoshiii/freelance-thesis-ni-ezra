import { z } from "zod";
import type { ScanFilters, SearchParams } from "./types";
import { dateWindow } from "./dates";

const schema = z.object({
  period: z.enum(["today", "7d", "30d", "all", "custom"]).default("all"),
  basis: z.enum(["scanned", "uploaded"]).default("scanned"),
  q: z.string().trim().max(120).default(""),
  location: z.string().trim().max(120).default(""),
  from: z.string().default(""),
  to: z.string().default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});

export const defaultFilters: ScanFilters = { period: "all", basis: "scanned", q: "", location: "", from: "", to: "", page: 1 };

export function parseFilters(params: SearchParams): ScanFilters {
  const entries = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const parsed = schema.safeParse(entries);
  if (!parsed.success) throw new Error("Check the scan filters and try again.");
  dateWindow(parsed.data.period, parsed.data.from, parsed.data.to);
  return parsed.data;
}

export function filterQuery(filters: ScanFilters, changes: Partial<ScanFilters> = {}) {
  const updated = { ...filters, ...changes };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(updated)) {
    if (value !== "" && !(key === "page" && value === 1)) params.set(key, String(value));
  }
  return params.toString();
}
