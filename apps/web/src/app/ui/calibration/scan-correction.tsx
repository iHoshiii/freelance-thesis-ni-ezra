import type { Scan } from "@/lib/scans/types";
import { signedOffset } from "@/lib/calibration/ph-offset";

export function ScanCorrection({ scan }: { scan: Scan }) {
  if (!scan.phCalibration) return null;
  return <p className="scan-correction">pH before offset: <strong>{scan.phCalibration.beforeOffset.toFixed(2)}</strong>. Applied offset: <strong>{signedOffset(scan.phCalibration.offset)}</strong>. Recorded pH: <strong>{scan.ph?.toFixed(2)}</strong>.</p>;
}
