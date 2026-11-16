"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { healthOptions } from "@/lib/workspace-queries";
import Link from "next/link";
import { formatDate } from "@/lib/scans/dates";
import type { DeviceSummary } from "@/lib/scans/types";
import { reportIsFresh, syncLabel, type DeviceReport } from "@/lib/telemetry";
import { Icon } from "./dashboard-icon";
import { useDeviceClock } from "./use-device-clock";
import { useOnlineStatus } from "./use-online-status";

export function DeviceMonitor({ devices, reports, telemetryAvailable, checkedAt, detailed = false }: {
  devices: DeviceSummary[]; reports: DeviceReport[]; telemetryAvailable: boolean; checkedAt: number; detailed?: boolean;
}) {
  const [selected, setSelected] = useState(devices[0]?.id ?? "");
  const now = useDeviceClock(checkedAt);
  const device = devices.find((item) => item.id === selected) ?? devices[0];
  const report = reports.find((item) => item.deviceId === device?.id);
  const fresh = reportIsFresh(report, now);
  const sensorProblem = report && Object.values(report.data.sensors).includes("error");
  const ready = !fresh ? "--" : report!.data.ready && !sensorProblem ? "Ready" : "Needs attention";
  return <section className={`panel monitor-panel${detailed ? " monitor-detailed" : ""}`} aria-label="Device monitor">
    <div className="panel-heading"><div className="section-title"><h2>Device</h2>{devices.length === 1 && device && <span className="device-name muted">{device.label}</span>}</div>{devices.length > 1 ? <select aria-label="Device to monitor" value={device?.id ?? ""} onChange={(event) => setSelected(event.target.value)}>{devices.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select> : !detailed && <Link className="text-link" href="/status">Status<Icon name="arrow" /></Link>}</div>
    <div className="monitor-metrics">
      <div><span>Offline scans</span><strong>{fresh ? report!.data.pendingScans.toLocaleString() : "--"}</strong></div>
      <div><span>Synced scans</span><strong>{device ? device.scanCount.toLocaleString() : "--"}</strong></div>
      <div><span>Battery</span><strong className={fresh && report!.data.batteryPercent !== null && report!.data.batteryPercent <= 20 ? "battery-low" : ""}>{fresh && report!.data.batteryPercent !== null ? `${report!.data.batteryPercent}%` : "--"}</strong></div>
    </div>
    {fresh && <div className="monitor-state"><span className={`health-pill ${report?.data.syncState === "idle" ? "health-good" : "health-neutral"}`}><span className="status-dot" />{syncLabel(report, now)}</span><span>{ready}</span></div>}
    {detailed && <div className="sensor-grid">{([['ph', 'pH sensor'], ['moisture', 'Moisture sensor'], ['temperature', 'Temperature sensor'], ['npk', 'NPK sensor']] as const).map(([key, label]) => {
      const state = fresh ? report!.data.sensors[key] : "unknown";
      return <div className="sensor-row" key={key}><span>{label}</span><strong className={`health-pill ${state === "ok" ? "health-good" : state === "error" ? "health-bad" : "health-neutral"}`}>{({ ok: "OK", error: "Problem reported", unknown: "--", not_installed: "Not installed" })[state]}</strong></div>;
    })}</div>}
    {fresh && report?.data.lastError && <p className="device-error" role="status">{report.data.lastError}</p>}
    {detailed && (report || !telemetryAvailable) && <div className="monitor-footer">{report ? <span title={fresh ? "Last device report" : "Last device report is stale"}>{formatDate(report.receivedAt, true)}{!fresh && " · Offline"}</span> : <Link href="/setup">Set up device reporting <Icon name="arrow" /></Link>}</div>}
  </section>;
}

export function ServiceHealth() {
  const query = useQuery(healthOptions());
  const online = useOnlineStatus();
  const health = query.isError || query.isPaused || !online ? { server: "unavailable", database: "unknown", schema: false } : query.data ?? { server: "checking", database: "unknown", schema: false };
  const checks = [
    { name: "Web server", good: health.server === "connected", text: health.server === "connected" ? "Connected" : health.server === "checking" ? "Checking" : "Cannot reach server" },
    { name: "Database", good: health.database === "connected", text: ({ connected: "Connected", not_configured: "Not configured", unavailable: "Connection failed", unknown: "Cannot check" } as Record<string, string>)[health.database] ?? "Checking" },
    { name: "Scan storage", good: health.server === "connected" && health.database === "connected" && health.schema, text: health.database === "connected" ? health.schema ? "Tables ready" : "Setup required" : "Cannot check" },
  ];
  return <section className="panel service-panel" aria-label="Connection health"><div className="panel-heading"><h2>Connections</h2></div><div className="service-checks">{checks.map((check) => <div key={check.name}><span>{check.name}</span><strong className={`health-pill ${check.good ? "health-good" : "health-neutral"}`}><span className="status-dot" />{check.text}</strong></div>)}</div></section>;
}
