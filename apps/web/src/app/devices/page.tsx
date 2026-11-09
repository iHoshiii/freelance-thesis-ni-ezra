import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { loadDevices } from "@/lib/scans/repository";
import { formatDate } from "@/lib/scans/dates";
import { WorkspaceShell, WorkspaceLoading } from "../ui/workspace-shell";
import { Icon } from "../ui/dashboard-icon";

async function DeviceContent() {
  await connection();
  const data = await loadDevices();
  return <WorkspaceShell current="/devices" title="Devices" lastUpload={data.lastUpload}><div className="page-heading"><div><p className="eyebrow">FIELD UNITS</p><h1>Your devices</h1><p>Devices assigned to this research workspace.</p></div><Link className="button button-primary" href="/setup">Device setup <Icon name="arrow" /></Link></div>
    {data.status === "unavailable" && <div className="notice notice-warning" role="alert">Device records are unavailable. Check database setup.</div>}
    <div className="device-grid">{data.devices.map((device) => <article className="panel device-card" key={device.id}><span className="device-symbol"><Icon name="device" /></span><h2>{device.label}</h2><p>{device.id}</p><dl><div><dt>Uploaded scans</dt><dd>{device.scanCount.toLocaleString()}</dd></div><div><dt>Last contact</dt><dd>{device.lastContactAt ? formatDate(device.lastContactAt) : "No uploads yet"}</dd></div></dl><Link href="/scans">Browse scans <Icon name="arrow" /></Link></article>)}</div>
    {data.devices.length === 0 && <section className="panel empty-state"><span className="empty-icon"><Icon name="device" /></span><h2>No devices yet</h2><p>Provision a device and add it to this workspace.</p><Link className="button button-primary" href="/setup">Open setup</Link></section>}
  </WorkspaceShell>;
}

export default function Devices() {
  return <Suspense fallback={<WorkspaceLoading />}><DeviceContent /></Suspense>;
}
