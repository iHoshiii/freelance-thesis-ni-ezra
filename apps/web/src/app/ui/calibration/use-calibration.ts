"use client";

import { useMemo, useSyncExternalStore } from "react";
import { calibrationServerSnapshot, calibrationSnapshot, parseCalibrationSnapshot, subscribeCalibration } from "@/lib/calibration/browser-store";

export function useCalibration() {
  const snapshot = useSyncExternalStore(subscribeCalibration, calibrationSnapshot, calibrationServerSnapshot);
  return useMemo(() => parseCalibrationSnapshot(snapshot), [snapshot]);
}
