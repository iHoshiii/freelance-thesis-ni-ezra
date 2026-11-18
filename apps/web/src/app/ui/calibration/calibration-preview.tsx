"use client";

import { useState } from "react";
import { correctedPh, serialOffsetCommand, signedOffset } from "@/lib/calibration/ph-offset";
import { Icon } from "../dashboard-icon";

export function CalibrationPreview({ deviceId, offset, measured, previousOffset }: { deviceId: string; offset: number | null; measured: number; previousOffset: number }) {
  const [testReading, setTestReading] = useState("");
  const [copied, setCopied] = useState({ command: "", message: "" });
  const command = offset === null ? "" : serialOffsetCommand(deviceId, offset);
  const preview = testReading.trim() && offset !== null ? correctedPh(Number(testReading), previousOffset, offset) : null;
  const referenceResult = offset === null ? null : correctedPh(measured, previousOffset, offset);
  async function copyCommand() {
    try { await navigator.clipboard.writeText(command); setCopied({ command, message: "Command copied. Paste it into the device's Serial Monitor." }); }
    catch { setCopied({ command, message: "Copy unavailable. Select and copy the command below." }); }
  }
  return <section className="panel calibration-preview"><div className="calibration-section-heading"><span className="calibration-symbol"><Icon name="ph" /></span><h2>Correction preview</h2></div>
    <div className="calibration-result"><span>New device offset</span><strong>{offset === null ? "--" : signedOffset(offset)}<small> pH</small></strong></div>
    <p className="calibration-equation">New offset = existing offset + reference pH - measured pH</p>
    {referenceResult !== null && <div className="calibration-example"><span>{measured.toFixed(2)} measured</span><Icon name="arrow" /><strong>{referenceResult.toFixed(2)} corrected</strong></div>}
    <label className="calibration-field">Try another device reading<input type="number" min="0" max="14" step="any" value={testReading} onChange={(event) => setTestReading(event.target.value)} placeholder="Enter pH" /></label>
    <p className="calibration-test-result" aria-live="polite">{!testReading.trim() || offset === null ? "Enter a reading to test the correction." : preview === null ? "Outside pH 0 to 14. Check the offset; this result will not be recorded." : `Corrected pH: ${preview.toFixed(2)}`}</p>
    <div className="calibration-apply"><h3>Apply through USB Serial</h3><p>After installing the updated firmware, send this command to the matching ESP32. It saves the offset on the device for future scans.</p>
      <code aria-label="Device calibration command">{command || "Complete the reference check first."}</code>
      <button className="button button-secondary" type="button" onClick={copyCommand} disabled={!command}><Icon name="compare" />Copy device command</button>
      <p>Send <code>ph-offset</code> to check the current device offset. Send <code>ph-offset {deviceId} 0</code> to reset it.</p><p className="calibration-copy-status" role="status">{copied.command === command ? copied.message : ""}</p>
    </div>
  </section>;
}
