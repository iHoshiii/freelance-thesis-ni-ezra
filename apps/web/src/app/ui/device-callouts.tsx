"use client";

import { useId, useRef } from "react";
import type { ModelViewerElement } from "@google/model-viewer";
import type { DeviceSummary } from "@/lib/scans/types";
import { reportIsFresh, syncLabel, type DeviceReport } from "@/lib/telemetry";
import { deviceAnchors } from "./device-anchors";
import { useDevicePointers } from "./use-device-pointers";

export type DeviceModelReadings = {
  devices: DeviceSummary[]; device?: DeviceSummary; report?: DeviceReport; now: number; onDeviceChange: (id: string) => void;
};

export function DeviceCallouts({ viewer, devices, device, report, now, onDeviceChange }: DeviceModelReadings & { viewer: ModelViewerElement | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const arrow = `device-arrow-${useId().replaceAll(":", "")}`;
  useDevicePointers(viewer, ref);
  const fresh = reportIsFresh(report, now);
  const battery = fresh ? report!.data.batteryPercent : null;
  const sensorProblem = report && Object.values(report.data.sensors).includes("error");
  return <div className="device-callouts" ref={ref} role="region" aria-label="Device monitor">
    <svg className="device-pointer-lines" aria-hidden="true"><defs><marker id={arrow} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 7 3.5 0 7" fill="none" stroke="currentColor" strokeWidth="1.2" /></marker></defs>{deviceAnchors.map(({ key }) => <path key={key} data-pointer={key} markerEnd={`url(#${arrow})`} />)}</svg>
    <div className="device-callout device-callout-device" data-callout="device"><h2>Device{fresh && <span className={report!.data.ready && !sensorProblem ? "callout-ok" : "callout-problem"}>{report!.data.ready && !sensorProblem ? "Ready" : "Needs attention"}</span>}</h2>{devices.length > 1 ? <select aria-label="Device to monitor" value={device?.id ?? ""} onChange={(event) => onDeviceChange(event.target.value)}>{devices.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select> : <span className="callout-device-name" title={device?.label}>{device?.label ?? "Field unit"}</span>}<dl><div><dt>Offline scans</dt><dd>{fresh ? report!.data.pendingScans.toLocaleString() : "--"}</dd></div><div><dt>Synced scans</dt><dd>{device ? device.scanCount.toLocaleString() : "--"}</dd></div></dl>{fresh && <small className="callout-sync">{syncLabel(report, now)}</small>}</div>
    <div className="device-callout device-callout-battery" data-callout="battery"><span>Battery</span><strong className={battery !== null && battery <= 20 ? "callout-problem" : undefined}>{battery !== null ? `${battery}%` : "--"}</strong></div>
    {deviceAnchors.filter((item) => "label" in item).map(({ key, label }) => {
      const state = fresh ? report!.data.sensors[key] : "unknown";
      return <div key={key} className={`device-callout device-callout-${key}`} data-callout={key}><span>{label}</span><strong className={state === "ok" ? "callout-ok" : state === "error" ? "callout-problem" : undefined}>{({ ok: "OK", error: "Problem reported", unknown: "--", not_installed: "Not installed" })[state]}</strong></div>;
    })}
    {fresh && report?.data.lastError && <p className="model-device-error" role="status" title={report.data.lastError}>{report.data.lastError}</p>}
  </div>;
}
