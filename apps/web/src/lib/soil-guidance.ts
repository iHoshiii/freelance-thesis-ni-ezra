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
    { key: "ph", title: "Soil pH", value: scan?.ph ?? null, unit: "pH", status: scan?.ph == null ? "No reading" : phBand(scan.ph), action: scan?.ph == null ? "Take a calibrated pH reading first." : scan.ph < 6 || scan.ph > 7 ? "Confirm with a soil test and check the crop's pH target before adding lime or sulfur." : "A common range for many vegetables. Check your crop's target before adjusting soil." },
    { key: "moisture", title: "Moisture", value: scan?.moisturePercent ?? null, unit: "%", status: scan?.moisturePercent == null ? "No reading" : "Calibration needed for advice", action: "Calibrate this sensor for your soil and compare with field capacity before choosing when to water." },
    { key: "temperature", title: "Temperature", value: scan?.temperatureC ?? null, unit: "°C", status: scan?.temperatureC == null ? "No reading" : "Compare with crop target", action: "Measure at the same depth and time. Choose a target for your crop and growth stage before deciding on planting or protection." },
    { key: "npk", title: "Nutrients (NPK)", value: null, unit: "", status: scan?.npkRaw ? "Raw readings · not validated" : "No reading", action: "Confirm N, P and K with a reference soil test. Fertilizer amounts need validated units, crop needs and the trained model." },
  ];
}
