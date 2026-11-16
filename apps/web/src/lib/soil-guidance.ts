import type { Scan } from "./scans/types";

export function phBand(value: number) {
  if (value < 4) return "Very acidic";
  if (value < 6) return "Acidic";
  if (value <= 7) return "Slightly acidic to neutral";
  if (value <= 9) return "Alkaline";
  return "Very alkaline";
}
export function soilGuidance(scan: Scan | null) {
  return [
    { key: "ph", title: "Soil pH", value: scan?.ph ?? null, unit: "pH", status: scan?.ph == null ? "" : phBand(scan.ph), action: scan?.ph == null ? "" : scan.ph < 6 || scan.ph > 7 ? "Confirm with a soil test before adding lime or sulfur." : "Check your crop's pH target before making changes." },
    { key: "moisture", title: "Moisture", value: scan?.moisturePercent ?? null, unit: "%", status: "", action: scan?.moisturePercent == null ? "" : "Calibrate for your soil before setting watering targets." },
    { key: "temperature", title: "Temperature", value: scan?.temperatureC ?? null, unit: "°C", status: "", action: scan?.temperatureC == null ? "" : "Compare with your crop's target at the same depth." },
    { key: "npk", title: "Raw NPK", value: null, unit: "", status: "", action: scan?.npkRaw ? "Validate units with a soil test before choosing fertilizer." : "" },
  ];
}
