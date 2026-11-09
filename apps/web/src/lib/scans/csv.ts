import type { Scan } from "./types";

function cell(value: string | number | null | undefined) {
  if (value == null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[\s]*[=+\-@\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export const csvHeader = "Device ID,Device label,Scan ID,Record ID,Location,Scan time,Time quality,Upload time,pH,Moisture (%),Temperature (C),N,P,K,NPK unit\r\n";

export function scanCsvRow(scan: Scan) {
  return [scan.deviceId, scan.deviceLabel, scan.sampleId, scan.recordId, scan.location, scan.acquiredAt,
    scan.timeQuality, scan.receivedAt, scan.ph, scan.moisturePercent, scan.temperatureC,
    scan.npkRaw?.n, scan.npkRaw?.p, scan.npkRaw?.k, scan.npkRaw?.unit].map(cell).join(",") + "\r\n";
}
