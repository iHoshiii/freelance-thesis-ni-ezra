"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardOptions } from "@/lib/workspace-queries";
import { deviceIdSchema } from "@/lib/calibration/ph-offset";
import { WorkspaceShell } from "../ui/workspace-shell";
import { CalibrationEditor } from "../ui/calibration/calibration-editor";
import { useCalibration } from "../ui/calibration/use-calibration";

export default function Configuration() {
  const query = useQuery(dashboardOptions());
  const { profiles, error } = useCalibration();
  const [deviceId, setDeviceId] = useState("soil-001");
  const devices = query.data?.workspace.devices ?? [];
  const valid = deviceIdSchema.safeParse(deviceId).success;
  return <WorkspaceShell current="/configuration" title="Configuration"><div className="configuration-workspace">
    <div className="calibration-intro"><div><h2>Calibrate your pH reading</h2><p>Compare a verified reference with your device, then adjust the calculation for future scans.</p></div><span className="subtle-tag">Manual device application</span></div>
    <div className="calibration-device"><label className="calibration-field">Device ID<input list="calibration-devices" value={deviceId} maxLength={64} onChange={(event) => setDeviceId(event.target.value)} autoComplete="off" spellCheck={false} /></label><datalist id="calibration-devices">{devices.map((device) => <option key={device.id} value={device.id}>{device.label}</option>)}</datalist><p>Match the ID in your ESP32 configuration. Profiles stay in this browser and are separate for each device.{query.isError && " Device list unavailable; enter its ID manually."}</p></div>
    {valid ? <CalibrationEditor key={deviceId} deviceId={deviceId} profiles={profiles.filter((item) => item.deviceId === deviceId)} storageError={error} /> : <p className="calibration-error" role="alert">Enter a device ID using letters, numbers, underscores or hyphens.</p>}
    <div className="calibration-note"><strong>One reference checks the offset.</strong><p>Check a second reference to assess the slope across the range. Existing saved scans keep their recorded values. A correction outside pH 0 to 14 is treated as unavailable.</p><a href="https://wiki.dfrobot.com/sen0161-v2/docs/20941" target="_blank" rel="noreferrer">DFRobot two-point calibration guide</a></div>
  </div></WorkspaceShell>;
}
