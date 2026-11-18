import { calibrationFileSchema, calibrationProfileSchema, type CalibrationProfile } from "./ph-offset";

export const CALIBRATION_KEY = "soilsense:ph-calibration:v1";
const changedEvent = "soilsense:ph-calibration-changed";
export function calibrationSnapshot() {
  try { return localStorage.getItem(CALIBRATION_KEY); }
  catch { return "unavailable"; }
}
export function calibrationServerSnapshot() { return null; }
export function subscribeCalibration(notify: () => void) {
  const changed = (event: StorageEvent) => { if (event.key === CALIBRATION_KEY || event.key === null) notify(); };
  window.addEventListener("storage", changed);
  window.addEventListener(changedEvent, notify);
  return () => { window.removeEventListener("storage", changed); window.removeEventListener(changedEvent, notify); };
}

export function parseCalibrationSnapshot(raw: string | null): { profiles: CalibrationProfile[]; error: string | null } {
  if (raw === null) return { profiles: [], error: null };
  try {
    const result = calibrationFileSchema.parse(JSON.parse(raw));
    return { profiles: result.profiles, error: null };
  } catch {
    return { profiles: [], error: raw === "unavailable" ? "Browser storage is unavailable. You can still preview and copy the command." : "Saved calibration data could not be read. Existing browser data has been preserved." };
  }
}

export function saveCalibration(profile: CalibrationProfile) {
  calibrationProfileSchema.parse(profile);
  const existing = parseCalibrationSnapshot(calibrationSnapshot());
  if (existing.error) throw new Error(existing.error);
  const sameDevice = existing.profiles.filter((item) => item.deviceId === profile.deviceId).slice(0, 19);
  const others = existing.profiles.filter((item) => item.deviceId !== profile.deviceId);
  const data = calibrationFileSchema.parse({ version: 1, profiles: [profile, ...sameDevice, ...others] });
  try { localStorage.setItem(CALIBRATION_KEY, JSON.stringify(data)); }
  catch { throw new Error("Could not save calibration. Browser storage may be full or disabled."); }
  window.dispatchEvent(new Event(changedEvent));
}
