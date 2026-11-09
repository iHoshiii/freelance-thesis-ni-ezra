export type Scan = {
  deviceId: string;
  recordId: string;
  sampleId: string;
  deviceLabel: string;
  location: string | null;
  acquiredAt: string | null;
  receivedAt: string;
  timeQuality: string;
  ph: number | null;
  moisturePercent: number | null;
  temperatureC: number | null;
  npkRaw: { n: number; p: number; k: number; unit: string } | null;
};

export type DeviceSummary = {
  id: string;
  label: string;
  lastContactAt: string | null;
  scanCount: number;
};

export type ScanFilters = {
  period: "today" | "7d" | "30d" | "all" | "custom";
  basis: "scanned" | "uploaded";
  q: string;
  location: string;
  from: string;
  to: string;
  page: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;
export const PAGE_SIZE = 20;
export const scanKey = (scan: Pick<Scan, "deviceId" | "recordId">) => `${scan.deviceId}/${scan.recordId}`;
export const scanHref = (scan: Pick<Scan, "deviceId" | "recordId">) => `/scans/${encodeURIComponent(scan.deviceId)}/${scan.recordId}`;
