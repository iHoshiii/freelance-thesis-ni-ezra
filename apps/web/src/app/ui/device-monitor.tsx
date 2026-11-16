"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/scans/dates";
import type { DeviceSummary } from "@/lib/scans/types";
import { reportIsFresh, syncLabel, type DeviceReport } from "@/lib/telemetry";
import { Icon } from "./dashboard-icon";

export function DeviceMonitor({ devices, reports, telemetryAvailable, checkedAt, detailed = false }: {
  devices: DeviceSummary[]; reports: DeviceReport[]; telemetryAvailable: boolean; checkedAt: number; detailed?: boolean;
}) {
  const [selected, setSelected] = useState(devices[0]?.id ?? "");
  const [now, setNow] = useState(checkedAt);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(timer); }, []);
  const device = devices.find((item) => item.id === selected) ?? devices[0];
  const report = reports.find((item) => item.deviceId === device?.id);
  const fresh = reportIsFresh(report, now);
  const sensorProblem = report && Object.values(report.data.sensors).includes("error");
  const ready = !fresh ? "Not confirmed" : report!.data.ready && !sensorProblem ? "Ready" : "Needs attention";
  return <section className={`panel monitor-panel${detailed ? " monitor-detailed" : ""}`} aria-label="Device monitor">
    <div className="panel-heading"><div className="section-title"><Icon name="device" /><h2>Device monitor</h2></div>{devices.length > 1 ? <select aria-label="Device to monitor" value={device?.id ?? ""} onChange={(event) => setSelected(event.target.value)}>{devices.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select> : <span className="muted">{device?.label ?? "No device registered"}</span>}</div>
    <div className="monitor-metrics">
      <div><span>Offline scans</span><strong>{fresh ? report!.data.pendingScans.toLocaleString() : "--"}</strong><small>{fresh ? report!.data.pendingScans > 0 ? "Waiting on ESP32" : "Queue is empty" : "Queue not confirmed"}</small></div>
      <div><span>Synced scans</span><strong>{device ? device.scanCount.toLocaleString() : "--"}</strong><small>Saved in database</small></div>
      <div><span>Battery</span><strong>{fresh && report!.data.batteryPercent !== null ? `${report!.data.batteryPercent}%` : "--"}</strong><small>{fresh && report!.data.batteryPercent !== null ? report!.data.batteryPercent <= 20 ? "Charge soon" : "Reported by device" : "Not reported"}</small></div>
    </div>
    <div className="monitor-state"><span className={`health-pill ${fresh && report?.data.syncState === "idle" ? "health-good" : "health-neutral"}`}><Icon name="refresh" />{syncLabel(report, now)}</span><span>Device: <strong>{ready}</strong></span></div>
    {detailed && <div className="sensor-grid">{([['ph', 'pH sensor'], ['moisture', 'Moisture sensor'], ['temperature', 'Temperature sensor'], ['npk', 'NPK sensor']] as const).map(([key, label]) => {
      const state = fresh ? report!.data.sensors[key] : "unknown";
      return <div className="sensor-row" key={key}><span>{label}</span><strong className={`health-pill ${state === "ok" ? "health-good" : state === "error" ? "health-bad" : "health-neutral"}`}>{({ ok: "OK", error: "Problem reported", unknown: "Not confirmed", not_installed: "Not installed" })[state]}</strong></div>;
    })}</div>}
    {fresh && report?.data.lastError && <p className="device-error" role="status">{report.data.lastError}</p>}
    <div className="monitor-footer"><span>{report ? `Last report: ${formatDate(report.receivedAt, true)}${fresh ? "" : " · stale"}` : telemetryAvailable ? "Waiting for the first device report" : "Device reporting needs database setup"}</span><Link href="/setup">Setup <Icon name="arrow" /></Link></div>
  </section>;
}

export function ServiceHealth({ initialDatabase, initialSchema }: { initialDatabase: string; initialSchema: boolean }) {
  const [health, setHealth] = useState({ server: "connected", database: initialDatabase, schema: initialSchema });
  useEffect(() => {
    let disposed = false;
    let controller: AbortController | undefined;
    async function check() {
      controller?.abort();
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 7000);
      try {
        const response = await fetch("/api/health", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Health check unavailable");
        const result = await response.json();
        if (!disposed) setHealth(result);
      } catch { if (!disposed) setHealth({ server: "unavailable", database: "unknown", schema: false }); }
      finally { clearTimeout(timeout); }
    }
    void check();
    const timer = setInterval(check, 15000);
    return () => { disposed = true; clearInterval(timer); controller?.abort(); };
  }, []);
  const checks = [
    { name: "Web server", good: health.server === "connected", text: health.server === "connected" ? "Connected" : "Cannot reach server" },
    { name: "Database", good: health.database === "connected", text: ({ connected: "Connected", not_configured: "Not configured", unavailable: "Connection failed", unknown: "Cannot check" } as Record<string, string>)[health.database] ?? "Checking" },
    { name: "Scan storage", good: health.server === "connected" && health.database === "connected" && health.schema, text: health.database === "connected" ? health.schema ? "Tables ready" : "Setup required" : "Cannot check" },
  ];
  return <section className="panel service-panel" aria-label="Connection health"><div className="panel-heading"><h2>Connections</h2><span className="muted">Checks every 15 seconds</span></div><div className="service-checks">{checks.map((check) => <div key={check.name}><span>{check.name}</span><strong className={`health-pill ${check.good ? "health-good" : "health-neutral"}`}><span className="status-dot" />{check.text}</strong></div>)}</div></section>;
}
