"use client";

import { useState, type FormEvent } from "react";
import { calculateOffset, calibrationId, exportCalibration, offsetInputSchema, signedOffset, type CalibrationProfile } from "@/lib/calibration/ph-offset";
import { saveCalibration } from "@/lib/calibration/browser-store";
import { CalibrationPreview } from "./calibration-preview";
import { CalibrationHistory } from "./calibration-history";
import { Icon } from "../dashboard-icon";

export function CalibrationEditor({ deviceId, profiles, storageError }: { deviceId: string; profiles: CalibrationProfile[]; storageError: string | null }) {
  const [reference, setReference] = useState("");
  const [measured, setMeasured] = useState("");
  const [previousOffset, setPreviousOffset] = useState("0");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const complete = [reference, measured, previousOffset].every((value) => value.trim() !== "");
  const result = offsetInputSchema.safeParse({ reference: Number(reference), measured: Number(measured), previousOffset: Number(previousOffset) });
  const offset = complete && result.success ? calculateOffset(result.data) : null;
  function save(event: FormEvent) {
    event.preventDefault();
    if (offset === null) return;
    try {
      saveCalibration({ id: calibrationId(), deviceId, reference: Number(reference), measured: Number(measured), previousOffset: Number(previousOffset), offset, notes, savedAt: new Date().toISOString() });
      setMessage(`Saved ${signedOffset(offset)} pH in this browser. Apply the command separately on the ESP32.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save calibration."); }
  }
  function download() {
    const profile = profiles[0];
    if (!profile) return;
    const url = URL.createObjectURL(new Blob([exportCalibration(profile)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${deviceId}-ph-calibration.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="calibration-grid"><div className="calibration-left"><form className="panel calibration-form" onSubmit={save}>
    <div className="calibration-section-heading"><h2>pH reference check</h2><span className="subtle-tag">Offset correction</span></div>
    <p className="calibration-muted">Use a known buffer or independently verified reference. For example, a 4.00 reference reading 3.00 needs +1.00 when the existing offset is zero.</p>
    <div className="calibration-inputs"><label className="calibration-field">Reference pH<input required type="number" min="0" max="14" step="any" placeholder="e.g. 4.00" value={reference} onChange={(event) => { setReference(event.target.value); setMessage(""); }} /></label>
      <label className="calibration-field">Device measured pH<input required type="number" min="0" max="14" step="any" placeholder="e.g. 3.00" value={measured} onChange={(event) => { setMeasured(event.target.value); setMessage(""); }} /></label></div>
    <label className="calibration-field">Existing device offset (pH)<input required type="number" min="-14" max="14" step="any" value={previousOffset} onChange={(event) => { setPreviousOffset(event.target.value); setMessage(""); }} /><small>Use 0 for a new device. Check with <code>ph-offset</code> before recalibrating to avoid adding the same correction twice.</small></label>
    <label className="calibration-field">Reference and notes (optional)<textarea value={notes} maxLength={500} rows={2} placeholder="Buffer label, reference instrument, temperature or observations" onChange={(event) => { setNotes(event.target.value); setMessage(""); }} /></label>
    {complete && !result.success && <p className="calibration-error" role="alert">{result.error.issues[0].message}</p>}
    {storageError && <p className="calibration-error" role="alert">{storageError}</p>}
    <div className="calibration-form-actions"><button type="submit" className="button button-primary" disabled={offset === null || Boolean(storageError)}><Icon name="check" />Save in this browser</button><button type="button" className="button button-secondary" disabled={!profiles.length} onClick={download}><Icon name="download" />Export last saved check</button></div>
    <p className="calibration-save-status" role="status">{message || "Saving keeps a local record. The device changes after you send the USB Serial command."}</p>
  </form><CalibrationHistory profiles={profiles} /></div><CalibrationPreview deviceId={deviceId} offset={offset} measured={Number(measured)} previousOffset={Number(previousOffset)} /></div>;
}
