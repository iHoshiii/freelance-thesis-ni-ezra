import type { Scan } from "./types";

export type Metric = "ph" | "moisturePercent" | "temperatureC";
export function trendData(scans: Scan[], metric: Metric) {
  const ordered = scans.filter((scan) => scan.acquiredAt).toSorted((a, b) => Date.parse(a.acquiredAt!) - Date.parse(b.acquiredAt!));
  const valid = ordered.filter((scan) => scan[metric] !== null);
  const values = valid.map((scan) => scan[metric]!);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const first = ordered.length ? Date.parse(ordered[0].acquiredAt!) : 0;
  const last = ordered.length ? Date.parse(ordered.at(-1)!.acquiredAt!) : 1;
  const segments: { x: number; y: number; scan: Scan }[][] = [];
  let segment: typeof segments[number] = [];
  for (const scan of ordered) {
    if (scan[metric] === null) {
      if (segment.length) segments.push(segment);
      segment = [];
      continue;
    }
    segment.push({
      x: first === last ? 380 : 55 + (Date.parse(scan.acquiredAt!) - first) / (last - first) * 665,
      y: min === max ? 102 : 170 - (scan[metric]! - min) / (max - min) * 130,
      scan,
    });
  }
  if (segment.length) segments.push(segment);
  return { min, max, segments, count: valid.length, first: valid[0]?.acquiredAt ?? null, last: valid.at(-1)?.acquiredAt ?? null };
}
